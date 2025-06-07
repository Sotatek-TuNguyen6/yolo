import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  BadRequestException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { RolesGuard } from 'src/decorator/roles.guard';
import { AuthGuard } from '@nestjs/passport';
import { ApiResponse } from '@nestjs/swagger';
import { Category } from './entities/category.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from 'src/upload/upload.service';

@Controller('categories')
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly uploadService: UploadService,
  ) {}

  @Post()
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Create a new category' })
  @ApiBody({ type: CreateCategoryDto })
  @ApiResponse({
    status: 201,
    description: 'The category has been successfully created.',
    type: Category,
  })
  // @UseGuards(AuthGuard('jwt'), RolesGuard)
  // @Roles(UserRole.ADMIN)
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    const categories = await this.categoriesService.create(createCategoryDto);
    return {
      categories,
    };
  }

  @Post('with-image')
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Create a new category with image' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        description: { type: 'string' },
        slug: { type: 'string' },
        file: { type: 'string', format: 'binary' },
      },
      required: ['name', 'description', 'file'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'The category has been successfully created with image.',
    type: Category,
  })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  // @Roles(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  async createWithImage(
    @Body() createCategoryDto: CreateCategoryDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    try {
      if (!file) {
        throw new BadRequestException('Ảnh là bắt buộc');
      }

      // Upload ảnh
      const uploadedImage = await this.uploadService.uploadFile(file);

      // Tạo category với URL ảnh từ upload
      const category = await this.categoriesService.create({
        ...createCategoryDto,
        thumbnailImage: uploadedImage.url,
      });

      return { category };
    } catch (error) {
      throw new BadRequestException(
        `Lỗi khi tạo danh mục: ${
          typeof error === 'object' && error !== null && 'message' in error
            ? (error as Error).message
            : 'Unknown error'
        }`,
      );
    }
  }
  @Get()
  @ApiOperation({ summary: 'Get all categories' })
  @ApiResponse({
    status: 200,
    description: 'The list of categories',
    type: [Category],
  })
  async findAll() {
    const categories = await this.categoriesService.findAll();
    return categories;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a category by ID' })
  @ApiResponse({
    status: 200,
    description: 'The category with the given ID',
    type: Category,
  })
  async findOne(@Param('id') id: string) {
    const category = await this.categoriesService.findOne(id);
    return {
      category,
    };
  }

  @Patch(':id')
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Update a category by ID' })
  @ApiResponse({
    status: 200,
    description: 'The category has been successfully updated.',
    type: Category,
  })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    const category = await this.categoriesService.update(id, updateCategoryDto);
    return {
      category,
    };
  }

  @Delete(':id')
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Delete a category by ID' })
  @ApiResponse({
    status: 200,
    description: 'The category has been successfully deleted.',
  })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async remove(@Param('id') id: string) {
    const category = await this.categoriesService.remove(id);
    return {
      category,
    };
  }
}
