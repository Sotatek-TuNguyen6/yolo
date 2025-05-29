import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Req,
  UnauthorizedException,
  NotFoundException,
  InternalServerErrorException,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiTags,
  ApiQuery,
  ApiConsumes,
  ApiParam,
} from '@nestjs/swagger';
import { RolesGuard } from 'src/decorator/roles.guard';
import { AuthGuard } from '@nestjs/passport';
import { ColorsService } from 'src/colors/colors.service';
import { CategoriesService } from 'src/categories/categories.service';
import { SubCategoryService } from 'src/sub-category/sub-category.service';
import { LimitDto } from 'src/common/model/dtos.model';
import { PageDto } from 'src/common/model/dtos.model';
import { IQueryProduct, RequestUser } from 'src/interface/common.interface';
import { Gender, UserRole } from 'src/enum';
import { SearchDto } from './dto/search-product.dto';
import { UsersService } from 'src/users/users.service';
import { Roles } from 'src/decorator/roles.decorator';
import { Types } from 'mongoose';
import { Request } from 'express';
import * as qs from 'qs';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UploadService } from 'src/upload/upload.service';

// Define interface for the request with parsed query
interface RequestWithParsedQuery extends Request {
  _parsedQuery?: qs.ParsedQs;
}

@ApiTags('Products')
@ApiBearerAuth('jwt')
@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly colorsService: ColorsService,
    private readonly categoriesService: CategoriesService,
    private readonly subCategoriesService: SubCategoryService,
    private readonly usersService: UsersService,
    private readonly uploadService: UploadService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new product' })
  @ApiBody({ type: CreateProductDto })
  @ApiResponse({
    status: 201,
    description: 'The product has been successfully created.',
  })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  async create(@Body() createProductDto: CreateProductDto) {
    const product = await this.productsService.create(createProductDto);
    // for (const color of createProductDto.colors ?? []) {
    //   await this.colorsService.updateOne(color, {
    //     $push: {
    //       products: product._id,
    //     },
    //   });
    // }

    // if (createProductDto?.category) {
    //   await this.categoriesService.updateOne(createProductDto?.category, {
    //     $push: {
    //       products: product._id,
    //     },
    //   });
    // }

    return { product };
  }

  @Get()
  @ApiQuery({
    name: 'page',
    required: false,
    type: PageDto,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: LimitDto,
  })
  @ApiQuery({
    name: 'category',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'price[gte]',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'price[lte]',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'color',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'size',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'ratingAverage',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'isFreeShip',
    required: false,
    type: Boolean,
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    type: String,
  })
  @ApiOperation({ summary: 'Get all products' })
  @ApiResponse({
    status: 200,
    description: 'The products has been successfully fetched.',
  })
  async findAll(
    @Query() query: IQueryProduct,
    @Req() req: RequestWithParsedQuery,
  ) {
    // Lấy dữ liệu đã parse từ middleware
    const parsedQuery = (req._parsedQuery as IQueryProduct) || query;
    const [products, total] = await this.productsService.findAll(parsedQuery);

    const page = Math.ceil(Number(total) / (parsedQuery.limit ?? 9));
    const pageNum = Number(parsedQuery.page);
    const nextPage =
      pageNum && pageNum >= page ? null : (isNaN(pageNum) ? 1 : pageNum) + 1;
    const prevPage =
      pageNum && pageNum === 1 ? null : (isNaN(pageNum) ? 1 : pageNum) - 1;

    return {
      products,
      prevPage,
      nextPage,
      total,
    };
  }

  @Get('top')
  @ApiOperation({ summary: 'Get top products' })
  @ApiResponse({
    status: 200,
    description: 'The top products has been successfully fetched.',
  })
  async top() {
    const products = await this.productsService.top();
    return {
      products,
    };
  }

  @Get('new')
  @ApiOperation({ summary: 'Get new products' })
  @ApiResponse({
    status: 200,
    description: 'The new products has been successfully fetched.',
  })
  async new() {
    const products = await this.productsService.new();
    return {
      products,
    };
  }

  @Get('recommend-user')
  @ApiOperation({ summary: 'Get recommendation products' })
  @ApiResponse({
    status: 200,
    description: 'The recommendation products has been successfully fetched.',
  })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async recommendUser(@Req() req: RequestUser) {
    if (req.user?.gender !== Gender.OTHER) {
      const categoryId = await this.categoriesService.findCategoryByGender(
        req?.user?.gender || Gender.OTHER,
      );
      if (!categoryId)
        return {
          products: [],
        };
      const products = await this.productsService.recommendForUser(
        categoryId as string,
      );
      return {
        products,
      };
    }
    return {
      products: [],
    };
  }

  @Post('/search')
  @ApiOperation({ summary: 'Search products' })
  @ApiResponse({
    status: 200,
    description: 'The products has been successfully fetched.',
  })
  async getProductsBySearch(@Body() data: SearchDto) {
    const products = await this.productsService.search(data.search);
    return {
      products,
    };
  }

  @Get('related/:id')
  @ApiOperation({ summary: 'Get related products' })
  @ApiResponse({
    status: 200,
    description: 'The related products has been successfully fetched.',
  })
  async related(@Param('id') id: string) {
    const relatedProducts = await this.productsService.related(id);
    return {
      products: relatedProducts,
    };
  }

  @Get('/:slug')
  @ApiOperation({ summary: 'Get a product by slug' })
  @ApiResponse({
    status: 200,
    description: 'The product has been successfully fetched.',
  })
  async getProductBySlug(@Param('slug') slug: string) {
    const product = await this.productsService.findBySlug(slug, true);
    return {
      product,
    };
  }

  @Get('/detail/:id')
  @ApiOperation({ summary: 'Get a product by id' })
  @ApiResponse({
    status: 200,
    description: 'The product has been successfully fetched.',
  })
  async findOneProduct(@Param('id') id: string) {
    const product = await this.productsService.findOne(id);
    return {
      product,
    };
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    const product = await this.productsService.update(id, updateProductDto);
    return {
      product,
    };
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  async remove(@Param('id') id: string) {
    const result = await this.productsService.remove(id);
    return result;
  }

  @ApiOperation({ summary: 'Like a product' })
  @ApiResponse({
    status: 200,
    description: 'The product has been successfully liked.',
  })
  @Get('/like/:productId')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async likeProduct(@Param('productId') id: string, @Req() req: RequestUser) {
    if (!req.user) {
      throw new UnauthorizedException('Bạn cần đăng nhập để thích sản phẩm');
    }

    const product = await this.productsService.like(id, req.user.sub);
    const user = await this.usersService.findOne(req.user.sub.toString()); // cần có hàm này

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const alreadyLiked = user.favoriteProducts.some((prodId: Types.ObjectId) =>
      prodId.equals(product._id),
    );

    if (alreadyLiked) {
      return {
        product,
      };
    }

    await this.usersService.updateAny(req.user.sub.toString(), {
      $push: { favoriteProducts: { $each: [product._id], $position: 0 } },
    });

    return {
      product,
    };
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get('/unlike/:productId')
  @ApiOperation({ summary: 'Unlike a product' })
  @ApiResponse({
    status: 200,
    description: 'The product has been successfully unliked.',
  })
  async unlikeProduct(@Param('productId') id: string, @Req() req: RequestUser) {
    if (!req.user) {
      throw new UnauthorizedException('Bạn cần đăng nhập để bỏ thích sản phẩm');
    }

    const product = await this.productsService.unlike(id, req.user.sub);
    await this.usersService.updateAny(req.user.sub.toString(), {
      $pull: {
        favoriteProducts: product._id,
      },
    });
    return {
      product,
    };
  }

  @Get('/calculator-rating/:productId')
  async calculatorRating(@Param('productId') id: string) {
    const product = await this.productsService.findOne(id, true);

    try {
      const newProduct = await this.productsService.calcAverageRating(
        id,
        product.comments || [],
      );
      return { product: newProduct };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  @ApiOperation({ summary: 'Get recommender products' })
  @ApiResponse({
    status: 200,
    description: 'The recommender products has been successfully fetched.',
  })
  @Get('/recommender/:productId')
  async recommenderProducts(
    @Param('productId') id: string,
    // @Req() req: RequestUser,
  ) {
    const recommendProducts = await this.productsService.recommendation(id);

    return {
      products: recommendProducts,
    };
  }

  @Post('upload-images/:id')
  @ApiOperation({ summary: 'Upload images for a product' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        colorId: {
          type: 'string',
          description: 'Color ID to associate with the images',
        },
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'The images have been successfully uploaded.',
  })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadProductImages(
    @Param('id') id: string,
    @Body('colorId') colorId: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const fileUrls = files.map((file) => file.path);

    const product = await this.productsService.findOne(id);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Find if there's already an image group for this color
    const existingGroupIndex = product.imageUrls.findIndex(
      (group) => group.color.toString() === colorId,
    );

    if (existingGroupIndex >= 0) {
      // Add to existing group
      await this.productsService.updateAny(id, {
        $push: {
          [`imageUrls.${existingGroupIndex}.images`]: { $each: fileUrls },
        },
      });
    } else {
      // Create new image group
      await this.productsService.updateAny(id, {
        $push: {
          imageUrls: {
            color: new Types.ObjectId(colorId),
            images: fileUrls,
          },
        },
      });
    }

    const updatedProduct = await this.productsService.findOne(id);
    return { product: updatedProduct };
  }

  @Post('with-images')
  @ApiOperation({ summary: 'Create a new product with images' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        description: { type: 'string' },
        price: { type: 'number' },
        category: { type: 'string' },
        subCategory: { type: 'string' },
        colors: { type: 'array', items: { type: 'string' } },
        sizes: { type: 'array', items: { type: 'string' } },
        colorId: {
          type: 'string',
          description: 'Color ID for the uploaded images',
        },
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
        featuredImage: { type: 'string', format: 'binary' },
        // Optional fields
        isFreeShip: { type: 'boolean' },
        discount: { type: 'number' },
        stock: { type: 'number' },
        summary: { type: 'string' },
        content: { type: 'string' },
        subContent: { type: 'string' },
        availableQuantities: { type: 'number' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'The product has been successfully created with images.',
  })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FilesInterceptor('files', 10))
  async createWithImages(
    @Body() createProductDto: CreateProductDto,
    @Body('colorId') colorId: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    try {
      console.log(colorId);
      // luu cac anh da tao vao database
      const upload = await this.uploadService.uploadFile(files[0]);
      const uploadFiles = await Promise.all(
        files.slice(1).map((file) => this.uploadService.uploadFile(file)),
      );

      const allUploadedFiles = [upload, ...uploadFiles];
      const uploadedIds = allUploadedFiles.map((file) => file.public_id);

      try {
        // Kiểm tra colorId có phải là ObjectId hợp lệ không
        if (!Types.ObjectId.isValid(colorId)) {
          throw new BadRequestException(
            `ColorId "${colorId}" không phải là một ID hợp lệ`,
          );
        }

        // First create the product
        const product = await this.productsService.create({
          ...createProductDto,
          featuredImage: upload?.url || '',
          imageUrls: [
            {
              color: new Types.ObjectId(colorId),
              images: allUploadedFiles.map((file) => file.url) || [],
            },
          ],
        });

        // if (createProductDto?.category) {
        //   await this.categoriesService.updateOne(createProductDto?.category, {
        //     $push: {
        //       products: product._id,
        //     },
        //   });
        // }
        return { product };
      } catch (error) {
        // console.log(error);
        // Nếu tạo product lỗi, xóa tất cả ảnh đã upload
        await Promise.all(
          uploadedIds.map((id) => this.uploadService.deleteFile(id)),
        );
        throw error;
      }
    } catch (error) {
      throw new InternalServerErrorException(
        'Lỗi khi tạo sản phẩm: ' +
          (typeof error === 'object' && error !== null && 'message' in error
            ? (error as Error).message
            : 'Unknown error'),
      );
    }
  }
}
