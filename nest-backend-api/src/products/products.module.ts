import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from './entities/product.entity';
import { ColorsModule } from 'src/colors/colors.module';
import { CategoriesModule } from 'src/categories/categories.module';
import { SubCategoryModule } from 'src/sub-category/sub-category.module';
import { UsersModule } from 'src/users/users.module';
import { UploadModule } from 'src/upload/upload.module';
import { ConfigModule } from '@nestjs/config';
import { ConfigService } from '@nestjs/config';
import { getCloudinaryStorage } from 'src/config/cloudinary.storage';
import { MulterModule } from '@nestjs/platform-express';
import { configureCloudinary } from 'src/config/cloudinary.config';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
    MulterModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        // Configure cloudinary
        configureCloudinary(configService);

        // Return multer config
        return {
          storage: getCloudinaryStorage(configService),
        };
      },
      inject: [ConfigService],
    }),

    ColorsModule,
    CategoriesModule,
    SubCategoryModule,
    UsersModule,
    UploadModule,
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
