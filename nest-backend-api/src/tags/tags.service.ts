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

  findOne(id: string) {
    return this.tagModel.findById(id);
  }

  update(id: string, updateTagDto: UpdateTagDto) {
    return this.tagModel.findByIdAndUpdate(id, updateTagDto, { new: true });
  }

  remove(id: string) {
    return this.tagModel.findByIdAndDelete(id);
  }
}
