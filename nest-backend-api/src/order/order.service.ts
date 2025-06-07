import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, CustomerInfo, OrderDetail } from './entities/order.entity';
import { ProductsService } from 'src/products/products.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { CounterService } from 'src/common/services/counter.service';
import { OrderTrackingResponse } from './dto/order-tracking.dto';
import {
  OrderReportResponse,
  PaymentTypeStats,
  DeliveryTypeStats,
  DailyStats,
  ProductSale,
} from './dto/order-report.dto';
import { PaymentStatus } from 'src/enum';

const populate = [
  'orderDetails',
  'orderDetails.product',
  'orderDetails.product.category',
];

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    private readonly productsService: ProductsService,
    private readonly counterService: CounterService,
  ) {}

  async create(createOrderDto: CreateOrderDto) {
    try {
      const orderId = await this.counterService.getNextSequence('order');

      // Create customer info from DTO
      const customerInfo: CustomerInfo = {
        name: createOrderDto.customerName,
        email: createOrderDto.customerEmail,
        phone: createOrderDto.customerPhone,
      };

      // Create order details from products array
      const orderDetails: OrderDetail[] = [];

      for (const item of createOrderDto.products) {
        const product = await this.productsService.findByProductId(
          String(item.id),
        );
        console.log(product);
        if (!product) {
          throw new NotFoundException(`Product with ID ${item.id} not found`);
        }

        const orderDetailId =
          await this.counterService.getNextSequence('orderDetail');

        orderDetails.push({
          orderDetailId,
          product: product._id,
          quantity: item.quantity,
          price: product.price,
          imageId: item.selectedImageId,
        });

        // Decrease product stock for this item
        await this.productsService.decreaseProductStock(
          String(item.id),
          item.selectedImageId || '',
          item.quantity,
        );
      }

      // Calculate total quantity
      const totalQuantity = orderDetails.reduce(
        (sum, item) => sum + item.quantity,
        0,
      );

      const order = new this.orderModel({
        orderId,
        customerInfo,
        shippingAddress: createOrderDto.shippingAddress,
        township: createOrderDto.addressDetails.district,
        city: createOrderDto.addressDetails.city,
        state: createOrderDto.addressDetails.ward,
        zipCode: '',
        paymentType: createOrderDto.paymentType,
        deliveryType: createOrderDto.deliveryType,
        sendEmail: createOrderDto.sendEmail,
        totalPrice: parseFloat(createOrderDto.totalPrice),
        deliveryDate: createOrderDto.deliveryDate,
        orderDetails,
        totalQuantity,
      });

      const savedOrder = await order.save();

      // Fetch the order with populated fields to return
      return savedOrder;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async findAll() {
    const orders = await this.orderModel
      .find()
      .sort({
        createdAt: -1,
      })
      .populate(populate);

    return orders;
  }

  async findOne(id: string) {
    const order = await this.orderModel.findById(id).populate(populate);
    if (!order) throw new NotFoundException('Không tìm thấy order này');
    return order;
  }

  async update(id: string, updateOrderDto: Partial<Order>) {
    try {
      const order = await this.orderModel.findByIdAndUpdate(
        id,
        updateOrderDto,
        {
          new: true,
        },
      );
      return order;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async remove(id: string) {
    try {
      const order = await this.orderModel.findByIdAndDelete(id);
      if (!order) {
        throw new NotFoundException('Không tìm thấy order để xóa');
      }
      return order;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async deleteAll() {
    try {
      const orders = await this.orderModel.deleteMany(
        {},
        { validateBeforeSave: false },
      );
      return orders;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async orderTracking(
    orderId: string,
    email?: string,
  ): Promise<OrderTrackingResponse> {
    const order = await this.orderModel
      .findOne({
        orderId,
        ...(email && { 'customerInfo.email': email }),
      })
      .populate(populate);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Convert to plain object to modify
    const result = order.toObject() as unknown as OrderTrackingResponse;

    if (result.orderDetails && result.orderDetails.length > 0) {
      for (const detail of result.orderDetails) {
        if (detail.imageId) {
          const productWithImage = await this.productsService.findByImageId(
            detail.imageId,
          );
          detail.product = productWithImage;
        }
      }
    }

    return result;
  }

  async getOrderReport(
    startDate: Date,
    endDate: Date,
  ): Promise<OrderReportResponse> {
    // Get all orders within the date range
    const orders = await this.orderModel
      .find({
        orderDate: { $gte: startDate, $lte: endDate },
      })
      .populate(populate)
      .lean();

    // Calculate summary statistics
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce(
      (sum, order) => sum + (order.totalPrice || 0),
      0,
    );
    const totalItems = orders.reduce(
      (sum, order) => sum + (order.totalQuantity || 0),
      0,
    );

    // Group orders by payment type
    const paymentTypeStats: PaymentTypeStats = {};
    orders.forEach((order) => {
      const paymentType = order.paymentType;
      if (!paymentTypeStats[paymentType]) {
        paymentTypeStats[paymentType] = {
          count: 0,
          revenue: 0,
        };
      }
      paymentTypeStats[paymentType].count += 1;
      paymentTypeStats[paymentType].revenue += order.totalPrice || 0;
    });

    // Group orders by delivery type
    const deliveryTypeStats: DeliveryTypeStats = {};
    orders.forEach((order) => {
      const deliveryType = order.deliveryType;
      if (!deliveryTypeStats[deliveryType]) {
        deliveryTypeStats[deliveryType] = {
          count: 0,
          revenue: 0,
        };
      }
      deliveryTypeStats[deliveryType].count += 1;
      deliveryTypeStats[deliveryType].revenue += order.totalPrice || 0;
    });

    // Group orders by day
    const dailyStats: DailyStats = {};
    orders.forEach((order) => {
      const orderDate = new Date(order.orderDate);
      const dateString = orderDate.toISOString().split('T')[0]; // YYYY-MM-DD format

      if (!dailyStats[dateString]) {
        dailyStats[dateString] = {
          count: 0,
          revenue: 0,
          items: 0,
        };
      }

      dailyStats[dateString].count += 1;
      dailyStats[dateString].revenue += order.totalPrice || 0;
      dailyStats[dateString].items += order.totalQuantity || 0;
    });

    // Get top selling products
    const productSales: Record<string, ProductSale> = {};
    orders.forEach((order) => {
      if (order.orderDetails && order.orderDetails.length > 0) {
        order.orderDetails.forEach((detail) => {
          if (!detail.product) return;

          // Use a type guard to handle the populated vs non-populated case
          const productId =
            typeof detail.product === 'object' && detail.product !== null
              ? String(detail.product._id || 'unknown')
              : String(detail.product || 'unknown');

          // Get product name from product object if available
          let productName = 'Unknown Product';
          if (
            typeof detail.product === 'object' &&
            detail.product !== null &&
            'name' in detail.product
          ) {
            productName = String(detail.product.name);
          }

          if (!productSales[productId]) {
            productSales[productId] = {
              productId,
              name: productName,
              quantity: 0,
              revenue: 0,
            };
          }

          productSales[productId].quantity += detail.quantity || 0;
          productSales[productId].revenue +=
            detail.price * detail.quantity || 0;
        });
      }
    });

    // Convert to array and sort by quantity
    const topProducts = Object.values(productSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10); // Top 10 products

    return {
      summary: {
        totalOrders,
        totalRevenue,
        totalItems,
        averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
      },
      paymentTypeStats,
      deliveryTypeStats,
      dailyStats,
      topProducts,
      orders,
    };
  }

  async updatePaymentStatus(orderId: string, paymentStatus: PaymentStatus) {
    const order = await this.orderModel.findOneAndUpdate(
      { orderId },
      { paymentStatus },
      { new: true },
    );
    if (!order) throw new NotFoundException('Không tìm thấy order này');
    return order;
  }
}
