import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { ConfigModule } from '@nestjs/config';
import { ConfigService } from '@nestjs/config';
import { CommonModule } from 'src/common/common.module';
import { MulterModule } from '@nestjs/platform-express';
import { UploadModule } from 'src/upload/upload.module';
import { Category, CategorySchema } from './entities/category.entity';
import { getCloudinaryStorage } from 'src/config/cloudinary.storage';
import { MongooseModule } from '@nestjs/mongoose';
import { configureCloudinary } from 'src/config/cloudinary.config';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Category.name, schema: CategorySchema },
    ]),
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
    UploadModule,
    CommonModule,
  ],
  controllers: [CategoriesController],
  providers: [CategoriesService],
  exports: [CategoriesService],
})
export class CategoriesModule {}
