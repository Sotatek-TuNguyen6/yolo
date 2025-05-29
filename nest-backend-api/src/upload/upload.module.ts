import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { getCloudinaryStorage } from '../config/cloudinary.storage';
import { configureCloudinary } from '../config/cloudinary.config';
import { Upload } from './schema/upload.entities';
import { UploadSchema } from './schema/upload.entities';
import { MongooseModule } from '@nestjs/mongoose';
import { UploadService } from './upload.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Upload.name, schema: UploadSchema }]),
    ConfigModule,
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
  ],
  controllers: [UploadController],
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadModule {}
