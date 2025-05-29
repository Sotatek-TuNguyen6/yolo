import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order } from './entities/order.entity';
import { CartsService } from 'src/carts/carts.service';
import { ProductsService } from 'src/products/products.service';
import { UsersService } from 'src/users/users.service';
import { CreateOrderDto } from './dto/create-order.dto';

const populate = [
  'user',
  'items',
  'items.product',
  'items.product.category',
  'items.product.colors',
  'items.product.sizes',
  'items.color',
  'items.size',
];
@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    private readonly usersService: UsersService,
    private readonly cartsService: CartsService,
    private readonly productsService: ProductsService,
  ) {}

  async create(createOrderDto: CreateOrderDto, userId: string) {
    try {
      const user = await this.usersService.findOne(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Tính toán subTotal và total
      let subTotal = 0;
      const shippingFee = 30000; // Phí vận chuyển mặc định, có thể điều chỉnh sau

      // Lấy thông tin sản phẩm để tính giá
      for (const item of createOrderDto.items) {
        const product = await this.productsService.findOne(item.product);
        if (!product) {
          throw new NotFoundException(
            `Sản phẩm với ID ${item.product} không tồn tại`,
          );
        }
        // Tính giá cho từng item dựa trên số lượng
        const itemPrice = product.price * item.quantities;
        subTotal += itemPrice;
      }

      // Tính tổng tiền (tổng giá trị sản phẩm + phí vận chuyển)
      const total = subTotal + shippingFee;

      // Thêm subTotal và total vào đơn hàng
      const orderData = {
        ...createOrderDto,
        subTotal,
        total,
        shippingFee,
        user: userId,
      };

      const order = await this.orderModel.create(orderData);

      await this.usersService.updateAny(user._id as string, {
        $push: { orders: { $each: [order._id], $position: 0 } },
      });
      const { carts } = await this.cartsService.findAllByUserIdAndCount(userId);
      const ids = carts.map((c) => c._id);
      await this.usersService.updateAny(userId, {
        $pullAll: {
          carts: ids,
        },
      });

      await this.cartsService.deleteByUser(userId);

      for (const item of createOrderDto.items) {
        await this.productsService.updateAny(item.product, {
          $inc: {
            unitsSold: item.quantities,
          },
          $addToSet: { usersSold: userId },
        });
      }

      return order;
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
    // const total = await this.orderModel.countDocuments();

    return orders;
  }

  async findAllByUserIdAndCount(userId: string) {
    const orders = await this.orderModel
      .find({ user: userId })
      .sort({
        createdAt: -1,
      })
      .populate(populate);
    const total = await this.orderModel.countDocuments({ user: userId });

    return [orders, total];
  }

  async findOne(id: string) {
    const order = await this.orderModel.findById(id).populate([
      {
        path: 'user',
      },
      {
        path: 'items.product',
        populate: [
          { path: 'category' },
          { path: 'colors' },
          { path: 'sizes' },
          { path: 'imageUrls.color' },
        ],
      },
      {
        path: 'items.color',
      },
      {
        path: 'items.size',
      },
    ]);
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
}
