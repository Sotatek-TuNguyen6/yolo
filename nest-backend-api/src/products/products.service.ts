import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { Product } from './entities/product.entity';
import { InjectModel } from '@nestjs/mongoose';
import { handleQueryProducts, handleQuery } from 'src/utils';
import { ICommonObj, IQueryProduct } from 'src/interface/common.interface';
import { Comment } from 'src/comments/entities/comment.entity';
import { UploadService } from 'src/upload/upload.service';

const populate = [
  'colors',
  'category',
  'sizes',
  'comments',
  'subCategory',
  'likes',
];

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
    private readonly uploadService: UploadService,
  ) {}

  async search(q: string) {
    const products = await this.productModel
      .find({
        name: {
          $regex: q,
          $options: 'i',
        },
      })
      .sort('-createdAt');

    return products;
  }

  async create(data: Partial<Product>) {
    try {
      const product = new this.productModel(data);
      await product.save();

      return product;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async findAll(query: IQueryProduct) {
    const { skip, limit, sort, select } = handleQuery(query);
    const filters = handleQueryProducts(query);

    // Always exclude deleted products unless explicitly requested
    filters.isDeleted = { $ne: true };

    // console.log(filters);
    let newSort = sort;
    if (query.ratings) {
      newSort = `-ratingAverage ${sort}`;
    }
    const products = await this.productModel
      .find(filters)
      .skip(skip)
      .limit(limit)
      .sort(newSort)
      .select(select)
      .populate(populate);
    const total = await this.productModel
      .find(filters)
      .sort(sort)
      .countDocuments();

    return [products, total];
  }

  async findOne(id: string, isRelation = false, includeDeleted = false) {
    let query = this.productModel.findById(id);

    // Only include non-deleted products unless explicitly requested
    if (!includeDeleted) {
      query = query.where({ isDeleted: { $ne: true } });
    }

    if (isRelation) {
      query = query.populate(populate); // đảm bảo gán lại nếu cần populate
    }

    const product = await query.exec(); // rõ ràng hơn, tránh nhầm lẫn

    if (!product) {
      throw new NotFoundException('Không tìm thấy sản phẩm bằng id');
    }

    return product;
  }

  async findBySlug(slug: string, isRelation = false) {
    const query = this.productModel.findOne({
      slug,
      isDeleted: { $ne: true },
    });
    if (isRelation) {
      query.populate(populate);
    }
    const product = await query;
    if (!product) throw new NotFoundException('Không tìm thấy sản phẩm này');
    return product;
  }

  async update(id: string, data: Partial<Product>) {
    const product = await this.findOne(id);

    if (!product) throw new NotFoundException('Không tìm thấy sản phẩm này');

    try {
      Object.assign(product, data);
      await product.save();
      return product;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async remove(id: string) {
    try {
      const product = await this.productModel.findByIdAndDelete(id);
      if (!product) throw new NotFoundException('Không tìm thấy sản phẩm này');

      const imageUrls = product.imageUrls.map((image) => image.images).flat();

      console.log(imageUrls);
      for (const url of imageUrls) {
        await this.uploadService.deleteFileByUrl(url.toString());
      }

      return true;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async like(id: string, userId: Types.ObjectId) {
    const product = await this.findOne(id);
    if (!product) throw new NotFoundException('Không tìm thấy sản phẩm này');
    if (product.likes.includes(userId)) {
      product.likes = product.likes.filter((id) => id !== userId);
    } else {
      product.likes.push(userId);
    }
    await product.save();
    return product;
  }

  async unlike(id: string, userId: Types.ObjectId) {
    const product = await this.findOne(id);
    if (!product) throw new NotFoundException('Không tìm thấy sản phẩm này');
    product.likes = product.likes.filter((id) => id !== userId);
    await product.save();
    return product;
  }
  async updateAny(productId: string, data: ICommonObj, isRelation?: boolean) {
    try {
      const product = await this.productModel.findByIdAndUpdate(
        productId,
        data,
        {
          new: true,
          runValidators: true,
        },
      );
      if (!product) {
        throw new BadRequestException('Không tìm thấy sản phẩm này');
      }
      if (isRelation) {
        await product.populate(populate);
      }
      return product;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async calcAverageRating(productId: string, comments: Comment[]) {
    const product = await this.findOne(productId, true);
    const totalRating = comments?.reduce((total: number, c: Comment) => {
      return total + (c.rating ?? 0);
    }, 0);
    product.ratingAverage =
      totalRating === 0 ? 0 : Math.floor(totalRating / comments.length);
    const newProduct = await product.save();
    return newProduct;
  }

  async recommendation(id: string) {
    const product = await this.findOne(id);
    const recommendProducts = await this.productModel
      .find({
        _id: {
          $ne: product._id,
        },
        category: product.category,
        subCategory: product.subCategory,
        ratingAverage: { $gte: product.ratingAverage },
        isDeleted: { $ne: true },
      })
      .sort({
        ratingAverage: -1,
      })
      .limit(10);

    return recommendProducts;
  }

  async related(id: string) {
    const product = await this.findOne(id);
    const recommendProducts = await this.productModel
      .find({
        _id: {
          $ne: product._id,
        },
        category: product.category,
        isDeleted: { $ne: true },
      })
      .sort({ createdAt: -1 })
      .limit(10);

    return recommendProducts;
  }

  async top() {
    const products = await this.productModel
      .find({ isDeleted: { $ne: true } })
      .sort('-unitsSold -price')
      .populate(populate)
      .skip(0)
      .limit(12);
    return products;
  }

  async new() {
    const products = await this.productModel
      .find({ isDeleted: { $ne: true } })
      .sort('-createdAt')
      .populate(populate)
      .skip(0)
      .limit(12);
    return products;
  }

  async recommendForUser(categoryId: string) {
    const products = await this.productModel
      .find({
        category: categoryId,
        isDeleted: { $ne: true },
      })
      .sort('-price -unitsSold')
      .populate(populate)
      .skip(0)
      .limit(12);
    return products;
  }
}
