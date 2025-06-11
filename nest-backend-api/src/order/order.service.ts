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
  'userUpdate',
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

          const productTotalPrice =
            item.price *
            createOrderDto.products[index].quantity *
            (1 - item.discountPercent / 100);

          productsHtml += `
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">
                ${item.name} - ${color?.color || 'Màu mặc định'} - Size: ${createOrderDto.products[index].size}
              </td>
              <td style="padding: 10px; text-align: center; border-bottom: 1px solid #eee;">${item.price.toLocaleString('vi-VN')} đ</td>
              <td style="padding: 10px; text-align: center; border-bottom: 1px solid #eee;">${createOrderDto.products[index].quantity}</td>
              <td style="padding: 10px; text-align: center; border-bottom: 1px solid #eee;">${item.discountPercent}%</td>
              <td style="padding: 10px; text-align: right; border-bottom: 1px solid #eee;">${productTotalPrice.toLocaleString('vi-VN')} đ</td>
            </tr>
          `;
        }

        const shippingFee =
          createOrderDto.deliveryType === DeliveryType.SHIP ? 25000 : 0;
        const subtotal = totalPrice;
        const total = parseFloat(createOrderDto.totalPrice);

        const htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; padding: 20px; border-radius: 5px; background-color: #fff;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #333; margin: 0;">Xác Nhận Đơn Hàng</h1>
              <p style="color: #666; margin-top: 5px;">Cảm ơn bạn đã mua sắm cùng chúng tôi!</p>
            </div>
            
            <div style="margin-bottom: 25px;">
              <p>Kính gửi <strong>${createOrderDto.customerName}</strong>,</p>
              <p>Cảm ơn bạn đã đặt hàng tại cửa hàng của chúng tôi. Đơn hàng của bạn đã được xác nhận thành công.</p>
            </div>
            
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 25px;">
              <h2 style="color: #333; font-size: 18px; margin-top: 0; margin-bottom: 15px;">Thông Tin Đơn Hàng</h2>
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <div style="flex: 1;"><strong>Mã đơn hàng:</strong></div>
                <div style="flex: 1;">#${orderId}</div>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <div style="flex: 1;"><strong>Ngày đặt hàng:</strong></div>
                <div style="flex: 1;">${new Date().toLocaleDateString('vi-VN')}</div>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <div style="flex: 1;"><strong>Phương thức thanh toán:</strong></div>
                <div style="flex: 1;">${paymentTypeText}</div>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <div style="flex: 1;"><strong>Phương thức vận chuyển:</strong></div>
                <div style="flex: 1;">${deliveryTypeText}</div>
              </div>
            </div>
            
            <div style="margin-bottom: 25px;">
              <h2 style="color: #333; font-size: 18px; margin-bottom: 15px;">Danh sách sản phẩm trong đơn hàng</h2>
              <table style="width: 100%; border-collapse: collapse; border-radius: 8px; overflow: hidden;">
                <tr style="background-color: #f5f5f5;">
                  <th style="padding: 12px 10px; text-align: left; font-weight: 600; color: #333; border-bottom: 2px solid #eee;">Sản phẩm</th>
                  <th style="padding: 12px 10px; text-align: center; font-weight: 600; color: #333; border-bottom: 2px solid #eee;">Đơn giá</th>
                  <th style="padding: 12px 10px; text-align: center; font-weight: 600; color: #333; border-bottom: 2px solid #eee;">Số lượng</th>
                  <th style="padding: 12px 10px; text-align: center; font-weight: 600; color: #333; border-bottom: 2px solid #eee;">Giảm giá</th>
                  <th style="padding: 12px 10px; text-align: right; font-weight: 600; color: #333; border-bottom: 2px solid #eee;">Thành tiền</th>
                </tr>
                ${productsHtml}
              </table>
            </div>
            
            <div style="margin-bottom: 25px; border: 1px solid #eee; border-radius: 8px; padding: 15px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <div style="color: #555;">Tổng tiền hàng:</div>
                <div style="font-weight: 600;">${subtotal.toLocaleString('vi-VN')} VND</div>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <div style="color: #555;">Phí vận chuyển:</div>
                <div style="font-weight: 600;">${shippingFee.toLocaleString('vi-VN')} VND</div>
              </div>
              <div style="display: flex; justify-content: space-between; padding-top: 10px; border-top: 1px solid #eee;">
                <div style="font-weight: 700; font-size: 16px;">Tổng thanh toán:</div>
                <div style="font-weight: 700; font-size: 16px; color: #d23f57;">${total.toLocaleString('vi-VN')} VND</div>
              </div>
            </div>
            
            <div style="margin-bottom: 25px;">
              <h2 style="color: #333; font-size: 18px; margin-bottom: 15px;">Địa Chỉ Giao Hàng</h2>
              <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px;">
                <p style="margin: 0 0 5px 0;"><strong>${createOrderDto.customerName}</strong></p>
                <p style="margin: 0 0 5px 0;">${createOrderDto.customerPhone}</p>
                <p style="margin: 0 0 5px 0;">${createOrderDto.shippingAddress}</p>
              </div>
            </div>
            
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
              <p style="margin-top: 0;">Nếu bạn có bất kỳ câu hỏi nào về đơn hàng, vui lòng liên hệ với chúng tôi qua email hoặc số điện thoại cửa hàng.</p>
              <p style="margin-bottom: 0;">Cảm ơn bạn đã mua sắm cùng chúng tôi!</p>
            </div>
            
            <div style="text-align: center; font-size: 12px; color: #777; border-top: 1px solid #eee; padding-top: 15px;">
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

  async updatePaymentStatus(
    orderId: string,
    paymentStatus: PaymentStatus,
    userUpdate: string,
  ) {
    const order = await this.orderModel.findOneAndUpdate(
      { orderId },
      { paymentStatus, userUpdate },
      { new: true },
    );
    if (!order) throw new NotFoundException('Không tìm thấy order này');
    return order;
  }

  async updateOrderStatus(
    orderId: string,
    orderStatus: OrderStatus,
    userUpdate: string,
  ) {
    const order = await this.orderModel.findOneAndUpdate(
      { orderId },
      { orderStatus, userUpdate },
      { new: true },
    );
    if (!order) throw new NotFoundException('Không tìm thấy order này');
    return order;
  }
}
