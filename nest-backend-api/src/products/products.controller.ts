import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  InternalServerErrorException,
  UseInterceptors,
  UploadedFiles,
  Query,
} from '@nestjs/common';
import { IQueryProduct, ProductsService } from './products.service';
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
} from '@nestjs/swagger';
import { RolesGuard } from 'src/decorator/roles.guard';
import { AuthGuard } from '@nestjs/passport';
import { CategoriesService } from 'src/categories/categories.service';
import { LimitDto } from 'src/common/model/dtos.model';
import { PageDto } from 'src/common/model/dtos.model';
import { UserRole } from 'src/enum';
import { SearchDto } from './dto/search-product.dto';
import { UsersService } from 'src/users/users.service';
import { Roles } from 'src/decorator/roles.decorator';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UploadService } from 'src/upload/upload.service';
import { ImageMeta } from 'src/interface/imageMeta.interface';

interface ImageWithColor {
  url: string[];
  color: string;
  colorCode: string;
  quantity: number;
  size: string;
}

@ApiTags('Products')
@ApiBearerAuth('jwt')
@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly categoriesService: CategoriesService,
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
  async findAll(@Query() query: any) {
    // Lấy dữ liệu đã parse từ middleware
    const products = await this.productsService.findAll(query);

    return products;
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

  @Get('/search/any/product')
  @ApiOperation({ summary: 'Search products' })
  @ApiResponse({
    status: 200,
    description: 'The products has been successfully fetched.',
  })
  async getAnyProduct(@Query() query: { q: string }) {
    const products = await this.productsService.querySearch(query);
    return products;
  }
  @Get('/:productId')
  @ApiOperation({ summary: 'Get a product by productId' })
  @ApiResponse({
    status: 200,
    description: 'The product has been successfully fetched.',
  })
  async getProductByProductId(@Param('productId') productId: string) {
    const product = await this.productsService.findByProductId(productId);
    return product;
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

  @Patch(':productId')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  async update(
    @Param('productId') productId: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    const product = await this.productsService.update(
      productId,
      updateProductDto,
    );
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

  @Post('create-with-color-images')
  @ApiOperation({ summary: 'Create a product with multiple colored images' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        productId: { type: 'number' },
        name: { type: 'string' },
        description: { type: 'string' },
        price: { type: 'number' },
        category: { type: 'string' },
        imageColors: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              color: { type: 'string' },
              colorCode: { type: 'string' },
              fileNames: {
                type: 'array',
                items: { type: 'string' },
              },
              quantity: { type: 'number' },
            },
          },
          description:
            'Array of JSON objects with color information for each image',
        },
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
        stock: { type: 'number' },
        discountPercent: { type: 'number' },
        detail: { type: 'string' },
        tags: { type: 'array', items: { type: 'string' } },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description:
      'The product has been successfully created with multiple colored images.',
  })
  // @UseGuards(AuthGuard('jwt'), RolesGuard)
  // @Roles(UserRole.ADMIN)
  @UseInterceptors(FilesInterceptor('files', 10))
  async createWithColorImages(
    @Body() createProductDto: CreateProductDto,
    @Body('images') imagesMetaRaw: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!files || files.length === 0) {
      throw new InternalServerErrorException('No files uploaded');
    }

    // console.log('fimagesMetaRawiles', imagesMetaRaw);
    // console.log('files', efiles);
    try {
      // Parse image color data from JSON string
      let imagesMetaArray: ImageMeta[] = [];
      try {
        const parsed: unknown = imagesMetaRaw ? JSON.parse(imagesMetaRaw) : [];
        console.log('parsed', parsed);
        if (
          Array.isArray(parsed) &&
          parsed.every(
            (item) =>
              typeof item === 'object' &&
              item !== null &&
              'fileNames' in item &&
              'color' in item &&
              'colorCode' in item,
          )
        ) {
          imagesMetaArray = parsed as ImageMeta[];
        } else {
          throw new Error('Invalid format');
        }
      } catch {
        throw new InternalServerErrorException('Invalid images metadata');
      }

      const uploadResults: ImageWithColor[] = [];
      const uploadedIds: string[] = [];

      // Group files by color
      const filesByColor = new Map<string, Express.Multer.File[]>();

      // console.log(imagesMetaArray);
      for (const file of files) {
        const meta = imagesMetaArray.find((m) =>
          m.fileNames.includes(file.originalname),
        );
        if (!meta) {
          throw new InternalServerErrorException(
            `No metadata found for file: ${file.originalname}`,
          );
        }

        if (!filesByColor.has(meta.color)) {
          filesByColor.set(meta.color, []);
        }
        filesByColor.get(meta.color)?.push(file);
      }

      // Upload files for each color
      for (const [color, colorFiles] of filesByColor) {
        const meta = imagesMetaArray.find((m) => m.color === color);
        if (!meta) continue;

        const urls: string[] = [];
        for (const file of colorFiles) {
          try {
            const result = await this.uploadService.uploadFile(file);
            urls.push(result.url);
            uploadedIds.push(result.public_id);
          } catch (err) {
            // Cleanup uploaded files if there's an error
            for (const id of uploadedIds) {
              await this.uploadService.deleteFile(id);
            }
            throw new InternalServerErrorException(
              `Failed to upload ${file.originalname}: ${err instanceof Error ? err.message : 'Unknown error'}`,
            );
          }
        }

        uploadResults.push({
          url: urls,
          color: meta.color,
          colorCode: meta.colorCode,
          quantity: meta.quantity,
          size: meta.size,
        });
      }

      const createdProduct = await this.productsService.create({
        ...createProductDto,
        images: uploadResults,
      });

      return {
        product: createdProduct,
        message: `Product created successfully with ${uploadResults.length} colors and ${files.length} total images.`,
      };
    } catch (err) {
      throw new InternalServerErrorException(
        'Error creating product: ' +
          (err instanceof Error ? err.message : 'Unknown error'),
      );
    }
  }

  // @P q

  @Get('/count/get')
  async count(@Query() query: IQueryProduct) {
    const count = await this.productsService.count(query);
    return count;
  }

  @Get('report/stats')
  @ApiOperation({ summary: 'Get product statistics and reports' })
  @ApiResponse({
    status: 200,
    description: 'Product report generated successfully',
  })
  // @UseGuards(AuthGuard('jwt'), RolesGuard)
  // @Roles(UserRole.ADMIN)
  async getProductReport() {
    const report = await this.productsService.getProductReport();
    return {
      success: true,
      data: report,
    };
  }

  @Patch('/update-size/:productId')
  async updateSize(
    @Param('productId') productId: string,
    @Body() updateSizeDto: { imagesId: string; size: string[] },
  ) {
    const product = await this.productsService.updateSize(
      productId,
      updateSizeDto.imagesId,
      updateSizeDto.size,
    );
    return product;
  }

  @Patch(':productId/variants')
  async updateVariants(
    @Param('productId') productId: string,
    @Body() updateVariantsDto: { quantity: number; imagesId: string },
  ) {
    const product = await this.productsService.updateVariants(
      productId,
      updateVariantsDto,
    );
    return product;
  }

  @Delete(':productId/variants')
  async deleteVariant(
    @Param('productId') productId: string,
    @Body() body: { imagesId: string },
  ) {
    const product = await this.productsService.deleteVariant(
      productId,
      body.imagesId,
    );
    return product;
  }

  @Post(':productId/variants')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        color: { type: 'string' },
        colorCode: { type: 'string' },
        size: { type: 'array', items: { type: 'string' } },
        quantity: { type: 'integer' },
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
  @UseInterceptors(FilesInterceptor('files', 10))
  async createVariant(
    @Param('productId') productId: string,
    @Body()
    body: {
      color: string;
      colorCode: string;
      quantity: string;
      size: string[];
    },
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!files || files.length === 0) {
      throw new InternalServerErrorException('No files uploaded');
    }

    try {
      // Upload all files to Cloudinary
      const uploadedUrls: string[] = [];
      const uploadedIds: string[] = [];

      for (const file of files) {
        try {
          const result = await this.uploadService.uploadFile(file);
          uploadedUrls.push(result.url);
          uploadedIds.push(result.public_id);
        } catch (err) {
          // Cleanup already uploaded files if there's an error
          for (const id of uploadedIds) {
            await this.uploadService.deleteFile(id);
          }
          throw new InternalServerErrorException(
            `Failed to upload ${file.originalname}: ${err instanceof Error ? err.message : 'Unknown error'}`,
          );
        }
      }

      // Create new variant with uploaded image URLs
      const product = await this.productsService.createVariant(productId, {
        color: body.color,
        colorCode: body.colorCode,
        size: body.size,
        quantity: parseInt(body.quantity, 10),
        urls: uploadedUrls,
      });

      return {
        product,
        message: `Variant created successfully with ${files.length} images.`,
      };
    } catch (err) {
      throw new InternalServerErrorException(
        'Error creating variant: ' +
          (err instanceof Error ? err.message : 'Unknown error'),
      );
    }
  }
}
