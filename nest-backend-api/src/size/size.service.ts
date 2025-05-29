import { Injectable } from '@nestjs/common';
import { Size } from './entities/size.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class SizeService {
  constructor(@InjectModel(Size.name) private sizeModel: Model<Size>) {}
  create(createSizeDto: Partial<Size>) {
    return this.sizeModel.create(createSizeDto);
  }

  findAll() {
    return this.sizeModel.find();
  }

  findOne(id: string) {
    return this.sizeModel.findById(id);
  }

  update(id: string, updateSizeDto: Partial<Size>) {
    return this.sizeModel.findByIdAndUpdate(id, updateSizeDto);
  }

  remove(id: string) {
    return this.sizeModel.findByIdAndDelete(id);
  }
}
