import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Model } from 'mongoose';
import {
  Product,
  ProductImage,
  ProductImageDocument,
} from './entities/product.entity';
import { InjectModel } from '@nestjs/mongoose';
import { UploadService } from 'src/upload/upload.service';
import { CounterService } from 'src/common/services/counter.service';
import { Category } from 'src/categories/entities/category.entity';
import { ProductReportResponse } from './dto/product-report.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

const populate = ['category', 'tags'];
interface ProductFilter {
  name?: { $regex: string; $options: string };
  price?: { $lte: number };
  stock?: { $lte: number };
  category?: any;
  isDeleted?: { $ne: boolean };
}
export interface IQueryProduct {
  page?: number;
  order_by?: string;
  limit?: number;
  search?: string;
  offset?: number;
  price?: number;
  stock?: number;
  category?: string;
}

interface CategoryWithName {
  name: string;
  [key: string]: any;
}

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    private readonly uploadService: UploadService,
    private readonly counterService: CounterService,
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

  async create(data: CreateProductDto) {
    try {
      // Get the next sequence for product ID
      const productId = await this.counterService.getNextSequence('product');

      let stock = 0;

      if (data?.images) {
        for (const image of data.images) {
          stock += image.quantity;
        }
      }

      // Create a new product with the auto-incremented ID
      const product = new this.productModel({
        ...data,
        productId,
        stock,
      });

      await product.save();

      return product;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async findAll(query: IQueryProduct = {}) {
    const { limit = 10, offset = 0, order_by: queryOrderBy } = query;

    const filter: ProductFilter = { isDeleted: { $ne: true } };

    // Add filters based on query parameters
    if (query.search) {
      filter.name = { $regex: query.search, $options: 'i' };
    }

    if (query.price) {
      filter.price = { $lte: Number(query.price) };
    }

    if (query.stock) {
      filter.stock = { $lte: Number(query.stock) };
    }

    console.log(query.category);
    if (query.category) {
      // Find category by name first
      const category = await this.categoryModel.findOne({
        name: { $regex: query.category, $options: 'i' },
      });
      console.log(category);

      if (category) {
        filter.category = category._id;
      } else {
        // If category name doesn't match any category, return empty result
        // This ensures we don't return all products when category doesn't exist
        return [];
      }
    }

    // Handle orderby parameter
    let sortOption = {};
    const orderby = queryOrderBy as string;

    if (orderby === 'price') {
      sortOption = { price: 1 }; // ascending
    } else if (orderby === 'price-desc') {
      sortOption = { price: -1 }; // descending
    } else {
      sortOption = { createdAt: -1 }; // default: newest first
    }

    const products = await this.productModel
      .find(filter)
      .skip(Number(offset))
      .limit(Number(limit))
      .sort(sortOption)
      .populate(populate);

    return products;
  }

  async findOne(id: string, includeDeleted = false) {
    let query = this.productModel.findById(id);

    // Only include non-deleted products unless explicitly requested
    if (!includeDeleted) {
      query = query.where({ isDeleted: { $ne: true } });
    }

    query = query.populate(populate);

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

  async update(productId: string, updateProductDto: UpdateProductDto) {
    try {
      const product = await this.productModel
        .findOneAndUpdate({ productId }, updateProductDto, {
          new: true,
        })
        .populate(populate);
      return product;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async updateOne(id: any, updateData: any) {
    try {
      const product = await this.productModel
        .findByIdAndUpdate(id, updateData, { new: true })
        .populate(populate);
      return product;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async remove(id: string) {
    try {
      const product = await this.productModel.findByIdAndDelete(id);
      if (!product) throw new NotFoundException('Không tìm thấy sản phẩm này');

      const imageUrls = product.images.map((image) => image.url).flat();

      for (const url of imageUrls) {
        await this.uploadService.deleteFileByUrl(url.toString());
      }

      return true;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async mockData(data: Array<Record<string, any>>) {
    try {
      for (const item of data) {
        const productId = await this.counterService.getNextSequence('product');
        item.productId = productId;
      }
      const insertedProducts = await this.productModel.insertMany(data);
      return insertedProducts;
    } catch (error) {
      throw new InternalServerErrorException(
        'Error inserting mock data: ' +
          (error instanceof Error ? error.message : 'Unknown error'),
      );
    }
  }

  async findByProductId(productId: string) {
    const product = await this.productModel
      .findOne({ productId })
      .populate(populate);
    if (!product) throw new NotFoundException('Không tìm thấy sản phẩm này');
    return product;
  }

  async findByImageId(imageId: string) {
    try {
      // Tìm sản phẩm chứa hình ảnh có ID tương ứng
      const product = await this.productModel
        .findOne({
          'images._id': imageId,
        })
        .populate(populate);

      if (!product) {
        throw new NotFoundException(
          `Không tìm thấy sản phẩm với hình ảnh ID: ${imageId}`,
        );
      }

      // Tạo bản sao sản phẩm để chỉ giữ lại hình ảnh phù hợp
      const result = product.toObject();

      // Lọc chỉ giữ lại hình ảnh có ID phù hợp
      const matchingImage = product.images.find(
        (img: ProductImage & { _id: string }) => img._id.toString() === imageId,
      );

      if (matchingImage) {
        result.images = [matchingImage];
        // Có thể giữ nguyên mảng images hoặc thay thế bằng mảng chỉ chứa hình ảnh phù hợp
        // result.images = [matchingImage];
      }

      return result;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Lỗi khi tìm sản phẩm theo hình ảnh: ${error}`,
      );
    }
  }

  async count(query: IQueryProduct = {}) {
    const { category: categoryName } = query;
    const filter: ProductFilter = { isDeleted: { $ne: true } };
    if (categoryName) {
      const category = await this.categoryModel.findOne({
        name: { $regex: categoryName, $options: 'i' },
      });

      if (category) {
        filter.category = category._id;
      } else {
        return 0;
      }
    }
    const count = await this.productModel.countDocuments(filter);
    return count;
  }

  async getProductReport(): Promise<ProductReportResponse> {
    // Get all products with populated category
    const products = await this.productModel
      .find({ isDeleted: { $ne: true } })
      .populate('category') // This populates the category field
      .lean();

    // Calculate basic statistics
    const totalProducts = products.length;
    let totalStock = 0;
    let totalPrice = 0;
    let highestPrice = 0;
    let lowestPrice = products.length > 0 ? products[0].price : 0;

    // Category statistics
    const categoryStats: Record<
      string,
      { count: number; totalPrice: number; totalStock: number }
    > = {};

    // Price range statistics
    const priceRangeStats: Record<string, number> = {
      '0-50': 0,
      '51-100': 0,
      '101-200': 0,
      '201-500': 0,
      '501+': 0,
    };

    // Stock statistics
    const stockStats = {
      inStock: 0, // Stock > 0
      lowStock: 0, // 0 < Stock < 10
      outOfStock: 0, // Stock = 0
    };

    // Process each product
    for (const product of products) {
      // Basic stats
      const stock = product.stock || 0;
      const price = product.price || 0;

      totalStock += stock;
      totalPrice += price;

      if (price > highestPrice) highestPrice = price;
      if (price < lowestPrice) lowestPrice = price;

      // Price range stats
      if (price <= 50) priceRangeStats['0-50']++;
      else if (price <= 100) priceRangeStats['51-100']++;
      else if (price <= 200) priceRangeStats['101-200']++;
      else if (price <= 500) priceRangeStats['201-500']++;
      else priceRangeStats['501+']++;

      // Stock stats
      if (stock === 0) stockStats.outOfStock++;
      else if (stock < 10) stockStats.lowStock++;
      else stockStats.inStock++;

      // Category stats
      if (product.category) {
        // Since we're using .populate('category'), product.category is already the full Category object
        const category = product.category as unknown as CategoryWithName;
        const categoryName = category.name || 'Uncategorized';

        if (!categoryStats[categoryName]) {
          categoryStats[categoryName] = {
            count: 0,
            totalPrice: 0,
            totalStock: 0,
          };
        }

        categoryStats[categoryName].count++;
        categoryStats[categoryName].totalPrice += price;
        categoryStats[categoryName].totalStock += stock;
      }
    }

    // Calculate average price for each category
    const finalCategoryStats: Record<
      string,
      { count: number; averagePrice: number; totalStock: number }
    > = {};

    for (const [category, stats] of Object.entries(categoryStats)) {
      finalCategoryStats[category] = {
        count: stats.count,
        averagePrice:
          stats.count > 0
            ? parseFloat((stats.totalPrice / stats.count).toFixed(2))
            : 0,
        totalStock: stats.totalStock,
      };
    }

    // Get top products by stock
    const topProducts = products.slice(0, 10).map((p) => {
      // Since we're using .populate('category'), p.category is already the full Category object
      const category = p.category as unknown as CategoryWithName;
      const categoryName = category?.name || 'Uncategorized';

      return {
        id: String(p._id || ''),
        productId: p.productId,
        name: p.name || '',
        price: p.price || 0,
        stock: p.stock || 0,
        category: categoryName,
      };
    });

    return {
      summary: {
        totalProducts,
        totalActiveProducts: 0, // Default values
        totalInactiveProducts: 0, // Default values
        totalStock,
        averagePrice:
          totalProducts > 0
            ? parseFloat((totalPrice / totalProducts).toFixed(2))
            : 0,
        highestPrice,
        lowestPrice: totalProducts > 0 ? lowestPrice : 0,
      },
      categoryStats: finalCategoryStats,
      priceRangeStats,
      stockStats,
      topProducts,
    };
  }

  async updateSize(productId: string, imagesId: string, size: string[]) {
    const product = await this.productModel.findOne({ productId });
    if (!product) throw new NotFoundException('Không tìm thấy sản phẩm này');
    console.log(product.images);
    const image = product.images.find(
      (image) => (image as ProductImageDocument)._id == imagesId,
    );
    if (!image) throw new NotFoundException('Không tìm thấy hình ảnh này');
    image.size = size;

    await product.save();
    return product;
  }

  async updateVariants(
    productId: string,
    updateVariantsDto: { quantity: number; imagesId: string },
  ) {
    const product = await this.productModel.findOne({ productId });
    if (!product) throw new NotFoundException('Không tìm thấy sản phẩm này');
    const image = product.images.find(
      (image) =>
        (image as ProductImageDocument)._id == updateVariantsDto.imagesId,
    );
    if (!image) throw new NotFoundException('Không tìm thấy hình ảnh này');
    image.quantity = updateVariantsDto.quantity;
    await product.save();
    return product;
  }

  async deleteVariant(productId: string, imagesId: string) {
    const product = await this.productModel.findOne({ productId });
    if (!product) throw new NotFoundException('Không tìm thấy sản phẩm này');
    const image = product.images.find(
      (image) => (image as ProductImageDocument)._id == imagesId,
    );
    if (!image) throw new NotFoundException('Không tìm thấy hình ảnh này');
    product.stock -= image.quantity;
    product.images = product.images.filter(
      (image) => (image as ProductImageDocument)._id != imagesId,
    );

    await product.save();
    return product;
  }

  async createVariant(
    productId: string,
    variantData: {
      color: string;
      colorCode: string;
      size: string[];
      quantity: number;
      urls: string[];
    },
  ) {
    const product = await this.productModel.findOne({ productId });
    if (!product) throw new NotFoundException('Không tìm thấy sản phẩm này');

    // Create new variant with image
    const newVariant: ProductImage = {
      color: variantData.color,
      colorCode: variantData.colorCode,
      size: variantData.size,
      quantity: variantData.quantity,
      url: variantData.urls,
    };

    // Add to product images array
    product.images.push(newVariant);

    // Update total stock
    product.stock += variantData.quantity;

    await product.save();
    return product;
  }

  async decreaseProductStock(
    productId: string,
    imageId: string,
    quantity: number,
  ) {
    const product = await this.productModel.findOne({ productId });
    if (!product)
      throw new NotFoundException(
        `Không tìm thấy sản phẩm với ID ${productId}`,
      );

    // If imageId is provided, decrease that specific variant's quantity
    if (imageId && imageId.trim() !== '') {
      const image = product.images.find(
        (image) => (image as ProductImageDocument)._id == imageId,
      );

      if (!image)
        throw new NotFoundException(`Không tìm thấy variant với ID ${imageId}`);

      if (image.quantity < quantity) {
        throw new BadRequestException(
          `Variant này chỉ còn ${image.quantity} sản phẩm, không đủ số lượng ${quantity}`,
        );
      }

      // Decrease the variant quantity
      image.quantity -= quantity;
    }

    // Always decrease the total product stock
    if (product.stock < quantity) {
      throw new BadRequestException(
        `Sản phẩm này chỉ còn ${product.stock}, không đủ số lượng ${quantity}`,
      );
    }

    product.stock -= quantity;

    await product.save();
    return product;
  }
}
