import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { ConfigService } from '@nestjs/config';

// Define correct params type
interface CloudinaryStorageParams {
  folder: string;
  allowed_formats: string[];
  transformation: Array<{
    width: number;
    height: number;
    crop: string;
  }>;
}

// Create a function to get the cloudinary storage with ConfigService
export function getCloudinaryStorage(configService: ConfigService) {
  return new CloudinaryStorage({
    cloudinary,
    params: {
      folder: configService.get<string>('CLOUDINARY_FOLDER', 'products'),
      allowed_formats: ['jpg', 'png', 'jpeg'],
      transformation: [{ width: 800, height: 600, crop: 'limit' }],
    } as CloudinaryStorageParams,
  });
}
