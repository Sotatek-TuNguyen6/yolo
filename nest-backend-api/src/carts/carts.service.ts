import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cart, CartItem, CartItemDocument } from './entities/cart.entity';
import { CreateItemCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';

const populate = ['user', 'items.product', 'items.color', 'items.size'];

@Injectable()
export class CartsService {
  constructor(@InjectModel(Cart.name) private cartModel: Model<Cart>) {}

  async findOneByUser(userId: string) {
    const cart = await this.cartModel.findOne({ user: userId });
    if (!cart) return null;
    return { cart };
  }

  async findAllByUserId(userId: string) {
    const carts = await this.cartModel
      .find({ user: userId })
      .sort({
        createdAt: -1,
      })
      .populate(populate);
    const total = await this.cartModel.countDocuments({ user: userId });

    return { carts, total: total };
  }

  async create(data: CreateItemCartDto) {
    if (!data?.user) {
      throw new BadRequestException('Invalid user ID');
    }

    const cartUser = await this.findOneByUser(data.user.toString());
    try {
      if (!cartUser) {
        const cart = new this.cartModel({
          user: data.user,
          items: [data.item],
        });
        await cart.save();
        return cart.populate(populate);
      }

      const existingItem = cartUser.cart.items.find(
        (item) =>
          item.product.toString() === data.item.product.toString() &&
          item.color.toString() === data.item.color.toString() &&
          item.size.toString() === data.item.size.toString(),
      );

      if (existingItem) {
        const cart = await this.cartModel.findOneAndUpdate(
          {
            user: data.user,
            'items.product': data.item.product,
            'items.color': data.item.color,
            'items.size': data.item.size,
          },
          {
            $inc: { 'items.$.quantities': data.item.quantities },
          },
          { new: true, runValidators: true },
        );
        if (!cart) {
          throw new BadRequestException('Cart not found');
        }
        return cart.populate(populate);
      }

      const cart = await this.cartModel.findOneAndUpdate(
        { user: data.user },
        { $push: { items: data.item } },
        { new: true, runValidators: true },
      );
      if (!cart) {
        throw new BadRequestException('Cart not found');
      }
      return cart.populate(populate);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  findAll() {
    return this.cartModel.find().populate(populate);
  }

  async findAllByUserIdAndCount(userId: string) {
    const carts = await this.cartModel
      .find({ user: userId })
      .sort({
        createdAt: -1,
      })
      .populate(populate);
    const total = await this.cartModel.countDocuments({ user: userId });

    return { carts, total: total };
  }

  findOne(id: string) {
    return this.cartModel.findById(id).populate(populate);
  }

  async update(id: string, cartItem: UpdateCartDto) {
    const cart = await this.findOneByUser(id);
    if (!cart || !cartItem) {
      throw new BadRequestException('Cart not found');
    }
    try {
      const newItems = [...(cart.cart.items || [])];
      const indexItem = newItems.findIndex(
        (i) => i.product.toString() === cartItem?.item?.product.toString(),
      );
      if (indexItem > -1) {
        if (
          !cartItem?.item?.product ||
          !cartItem?.item?.color ||
          !cartItem?.item?.size ||
          !cartItem?.item?.quantities
        ) {
          throw new BadRequestException('Missing required cart item fields');
        }
        newItems[indexItem] = cartItem.item;
        const newCart = await this.cartModel.findOneAndUpdate(
          { user: id },
          {
            items: newItems,
          },
          {
            new: true,
            runValidators: true,
          },
        );

        return newCart;
      }

      throw new BadRequestException('Không tìm thấy item để cập nhật');
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async remove(id: string) {
    try {
      const cart = await this.cartModel.findByIdAndDelete(id);
      if (!cart) {
        throw new BadRequestException('Cart not found');
      }
      return cart;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async updateItems(id: string, userId: string, items: CartItem[]) {
    const cart = await this.findOneByUser(userId);
    if (!cart) {
      throw new BadRequestException('Cart not found');
    }
    try {
      cart.cart.items = items;
      const newCart = await this.cartModel.findOneAndUpdate(
        { _id: id, user: userId },
        {
          $set: {
            ...cart,
          },
        },
        {
          new: true,
          runValidators: true,
        },
      );
      return newCart;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async deleteItem(id: string, itemId: string, userId: string) {
    const cart = await this.findOneByUser(userId);
    if (!cart) {
      throw new BadRequestException('Cart not found');
    }
    const newItems: CartItemDocument[] = [...cart.cart.items];
    const idx = newItems.findIndex((i) => String(i._id) === String(itemId));
    try {
      if (idx > -1) {
        newItems.splice(idx, 1);
        if (newItems.length === 0) {
          await this.cartModel.findByIdAndDelete(cart.cart._id);
          return {};
        } else {
          const newCart = await this.cartModel.findOneAndUpdate(
            {
              user: id,
            },
            {
              $set: {
                items: newItems,
              },
            },
            {
              new: true,
              runValidators: true,
            },
          );
          if (!newCart) {
            throw new BadRequestException('Cart not found');
          }
          return newCart.populate(populate);
        }
      }
      throw new BadRequestException('Không tìm thấy item này để xóa');
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async deleteByUser(userId: string) {
    try {
      const cart = await this.cartModel.findOneAndDelete({
        user: userId,
      });
      if (!cart) {
        throw new BadRequestException('Không tìm thấy cart bằng id user này');
      }
      return cart;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
