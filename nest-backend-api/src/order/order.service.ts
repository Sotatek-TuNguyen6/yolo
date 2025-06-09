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
import {
  OrderStatus,
  PaymentStatus,
  PaymentType,
  DeliveryType,
} from 'src/enum';
import { MailService } from 'src/mail/mail.service';
import {
  ProductDocument,
  ProductImageDocument,
} from 'src/products/entities/product.entity';

const populate = [
  'orderDetails',
  'orderDetails.product',
  'orderDetails.product.category',
  'orderDetails.product.images',
];

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    private readonly productsService: ProductsService,
    private readonly counterService: CounterService,
    private readonly mailService: MailService,
  ) {}

  async create(createOrderDto: CreateOrderDto) {
    try {
      // console.log(createOrderDto);
      const orderId = await this.counterService.getNextSequence('order');

      // Create customer info from DTO
      const customerInfo: CustomerInfo = {
        name: createOrderDto.customerName,
        email: createOrderDto.customerEmail || '',
        phone: createOrderDto.customerPhone,
      };

      // Create order details from products array
      const orderDetails: OrderDetail[] = [];

      const listProduct: ProductDocument[] = [];
      for (const item of createOrderDto.products) {
        const product = await this.productsService.findByProductId(
          String(item.id),
        );
        // console.log(product);
        if (!product) {
          throw new NotFoundException(`Product with ID ${item.id} not found`);
        }

        listProduct.push(product);
        const orderDetailId =
          await this.counterService.getNextSequence('orderDetail');

        orderDetails.push({
          orderDetailId,
          product: product._id,
          quantity: item.quantity,
          price: product.price,
          imageId: item.selectedImageId,
          size: item.size,
          productName: product.name,
          discountPercent: product.discountPercent,
        });

        // Decrease product stock for this item
        await this.productsService.decreaseProductStock(
          String(item.id),
          item.selectedImageId || '',
          item.size || '',
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

      if (createOrderDto.sendEmail && createOrderDto.customerEmail) {
        // Create HTML email template in Vietnamese with order details
        const paymentTypeText =
          createOrderDto.paymentType === PaymentType.CASH_ON_DELIVERY
            ? 'Thanh toán khi nhận hàng'
            : 'Chuyển khoản ngân hàng';

        let deliveryTypeText = 'Giao hàng miễn phí';
        if (createOrderDto.deliveryType === DeliveryType.STORE_PICKUP) {
          deliveryTypeText = 'Nhận tại cửa hàng';
        } else if (createOrderDto.deliveryType === DeliveryType.SHIP) {
          deliveryTypeText = 'Giao hàng nhanh';
        }

        let productsHtml = '';
        let totalPrice = 0;
        for (const [index, item] of listProduct.entries()) {
          const color = item.images.find(
            (image) =>
              (image as ProductImageDocument)._id ==
              createOrderDto.products[index].selectedImageId,
          );
          totalPrice +=
            item.price * createOrderDto.products[index].quantity -
            (item.price *
              createOrderDto.products[index].quantity *
              item.discountPercent) /
              100;
          // console.log(color);
          productsHtml += `
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.name}</td>
              <td style="padding: 10px; text-align: center; border-bottom: 1px solid #ddd;">${createOrderDto.products[index].quantity}</td>
              <td style="padding: 10px; text-align: center; border-bottom: 1px solid #ddd;">${createOrderDto.products[index].size}</td>
              <td style="padding: 10px; text-align: center; border-bottom: 1px solid #ddd;">${color?.color}</td>
              <td style="padding: 10px; text-align: center; border-bottom: 1px solid #ddd;">${item.discountPercent}%</td>
              <td style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">${item.price.toLocaleString('vi-VN')} đ</td>
            </tr>
          `;
        }

        const htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; padding: 20px; border-radius: 5px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #333;">Xác Nhận Đơn Hàng</h1>
            </div>
            
            <div style="margin-bottom: 20px;">
              <p>Kính gửi <strong>${createOrderDto.customerName}</strong>,</p>
              <p>Cảm ơn bạn đã đặt hàng tại cửa hàng của chúng tôi. Đơn hàng của bạn đã được xác nhận thành công.</p>
            </div>
            
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
              <h2 style="color: #333; font-size: 18px; margin-top: 0;">Thông Tin Đơn Hàng</h2>
              <p><strong>Mã đơn hàng:</strong> #${orderId}</p>
              <p><strong>Ngày đặt hàng:</strong> ${new Date().toLocaleDateString('vi-VN')}</p>
              <p><strong>Phương thức thanh toán:</strong> ${paymentTypeText}</p>
              <p><strong>Phương thức vận chuyển:</strong> ${deliveryTypeText}</p>
            </div>
            
            <div style="margin-bottom: 20px;">
              <h2 style="color: #333; font-size: 18px;">Chi Tiết Sản Phẩm</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr style="background-color: #f2f2f2;">
                  <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">Sản phẩm</th>
                  <th style="padding: 10px; text-align: center; border-bottom: 1px solid #ddd;">Số lượng</th>
                  <th style="padding: 10px; text-align: center; border-bottom: 1px solid #ddd;">Size</th>
                  <th style="padding: 10px; text-align: center; border-bottom: 1px solid #ddd;">Màu</th>
                  <th style="padding: 10px; text-align: center; border-bottom: 1px solid #ddd;">Giảm giá</th>
                  <th style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">Giá</th>
                </tr>
                ${productsHtml}
                <tr>
                  <td colspan="5" style="padding: 10px; text-align: right; font-weight: bold;">Tổng tiền:</td>
                  <td style="padding: 10px; text-align: right; font-weight: bold;">${(totalPrice - (createOrderDto.deliveryType === DeliveryType.SHIP ? 25000 : 0)).toLocaleString('vi-VN')} đ</td>
                </tr> 
                 <tr>
                  <td colspan="5" style="padding: 10px; text-align: right; font-weight: bold;">Phí vận chuyển:</td>
                  <td style="padding: 10px; text-align: right; font-weight: bold;">${(createOrderDto.deliveryType === DeliveryType.SHIP ? 25000 : 0).toLocaleString('vi-VN')} đ</td>
                </tr>   
                <tr>
                  <td colspan="5" style="padding: 10px; text-align: right; font-weight: bold;">Tổng tiền sau ship:</td>
                  <td style="padding: 10px; text-align: right; font-weight: bold;">${parseFloat(createOrderDto.totalPrice).toLocaleString('vi-VN')} đ</td>
                </tr>
              </table>
            </div>
            
            <div style="margin-bottom: 20px;">
              <h2 style="color: #333; font-size: 18px;">Địa Chỉ Giao Hàng</h2>
              <p>${createOrderDto.customerName}</p>
              <p>${createOrderDto.customerPhone}</p>
              <p>${createOrderDto.shippingAddress}</p>
              <p>${createOrderDto.addressDetails.district}, ${createOrderDto.addressDetails.city}, ${createOrderDto.addressDetails.ward}</p>
            </div>
            
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
              <p>Nếu bạn có bất kỳ câu hỏi nào về đơn hàng, vui lòng liên hệ với chúng tôi qua email hoặc số điện thoại cửa hàng.</p>
              <p>Cảm ơn bạn đã mua sắm cùng chúng tôi!</p>
            </div>
            
            <div style="text-align: center; font-size: 12px; color: #777;">
              <p>© ${new Date().getFullYear()} - LUMEN – Thương hiệu quần áo dành cho nam giới hiện đại. Tất cả các quyền được bảo lưu.</p>
            </div>
          </div>
        `;

        await this.mailService.sendMail(
          createOrderDto.customerEmail,
          'Xác Nhận Đơn Hàng #' + orderId,
          htmlContent,
        );
      }

      // Fetch the saved order with all populated fields including product images
      const populatedOrder = await this.orderModel
        .findById(savedOrder._id)
        .populate(populate);

      return populatedOrder;
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
    search?: string,
  ): Promise<OrderTrackingResponse> {
    const order = await this.orderModel
      .findOne({
        orderId,
        ...(search && {
          $or: [
            { 'customerInfo.email': search },
            { 'customerInfo.phone': search },
          ],
        }),
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

  async updateOrderStatus(orderId: string, orderStatus: OrderStatus) {
    const order = await this.orderModel.findOneAndUpdate(
      { orderId },
      { orderStatus },
      { new: true },
    );
    if (!order) throw new NotFoundException('Không tìm thấy order này');
    return order;
  }
}
