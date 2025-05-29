import { Injectable, NotFoundException } from '@nestjs/common';
import { Upload } from './schema/upload.entities';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import cloudinary from 'src/config/cloudinary.config';

@Injectable()
export class UploadService {
  constructor(@InjectModel(Upload.name) private uploadModel: Model<Upload>) {}

  async uploadFile(file: Express.Multer.File) {
    const upload = await this.uploadModel.create({
      url: file.path,
      public_id: file.filename,
    });
    return upload;
  }

  async deleteFile(public_id: string) {
    await cloudinary.uploader.destroy(public_id);
    await this.uploadModel.deleteOne({ public_id: public_id });
  }

  async deleteFileByUrl(url: string) {
    const upload = await this.uploadModel.findOne({ url });
    if (!upload) {
      throw new NotFoundException('File not found');
    }
    await this.deleteFile(upload.public_id);
  }
}
