import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';

// Create a function to configure cloudinary with ConfigService
export function configureCloudinary(configService: ConfigService) {
  cloudinary.config({
    cloud_name: configService.get<string>('CLOUDINARY_CLOUD_NAME'),
    api_key: configService.get<string>('CLOUDINARY_API_KEY'),
    api_secret: configService.get<string>('CLOUDINARY_API_SECRET'),
  });
}

export default cloudinary;
