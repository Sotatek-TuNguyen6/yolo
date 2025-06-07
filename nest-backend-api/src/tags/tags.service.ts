import { Injectable } from '@nestjs/common';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tag } from './entities/tag.entity';

@Injectable()
export class TagsService {
  constructor(@InjectModel(Tag.name) private tagModel: Model<Tag>) {}

  create(createTagDto: CreateTagDto) {
    return this.tagModel.create(createTagDto);
  }

  findAll() {
    return this.tagModel.find();
  }

  findOne(id: number) {
    return this.tagModel.findById(id);
  }

  update(id: number, updateTagDto: UpdateTagDto) {
    return this.tagModel.findByIdAndUpdate(id, updateTagDto);
  }

  remove(id: number) {
    return this.tagModel.findByIdAndDelete(id);
  }
}
