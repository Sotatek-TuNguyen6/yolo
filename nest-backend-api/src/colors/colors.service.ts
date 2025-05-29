import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateColorDto } from './dto/create-color.dto';
import { UpdateColorDto } from './dto/update-color.dto';
import { Color } from './entities/color.entity';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { QueryParamsDto } from 'src/types';
import { getPagination } from 'src/utils';
import { ICommonObj } from 'src/interface/common.interface';

@Injectable()
export class ColorsService {
  constructor(@InjectModel(Color.name) private colorModel: Model<Color>) {}

  async create(createColorDto: CreateColorDto) {
    try {
      const color = await this.colorModel.create(createColorDto);

      return color;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async findAll(query: QueryParamsDto) {
    const { skip, limit, sortBy } = getPagination(query);

    return this.colorModel
      .find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: sortBy })
      .exec();
  }

  findOne(id: string) {
    return this.colorModel.findById(id);
  }

  update(id: string, updateColorDto: UpdateColorDto) {
    return this.colorModel.findByIdAndUpdate(id, updateColorDto, { new: true });
  }

  async updateOne(id: Types.ObjectId, updateColorDto: ICommonObj) {
    const color = await this.findOne(id.toString());

    if (!color) throw new NotFoundException('Không tìm thấy màu sắc này');

    try {
      await color.updateOne(updateColorDto);
      return color;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  remove(id: string) {
    return this.colorModel.findByIdAndDelete(id);
  }
}
