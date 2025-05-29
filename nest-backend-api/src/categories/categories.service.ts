import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Category } from './entities/category.entity';
import { Model, Types } from 'mongoose';
import { ICommonObj } from 'src/interface/common.interface';
import { Gender } from 'src/enum';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name)
    private categoryModel: Model<Category>,
  ) {}

  async create(createCategoryDto: Partial<Category>) {
    try {
      const category = await this.categoryModel.create(createCategoryDto);
      return category;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  findAll() {
    return this.categoryModel.find();
  }

  findOne(id: string) {
    return this.categoryModel.findById(id);
  }

  update(id: string, updateCategoryDto: Partial<Category>) {
    return this.categoryModel.findByIdAndUpdate(id, updateCategoryDto, {
      new: true,
    });
  }

  remove(id: string) {
    return this.categoryModel.findByIdAndDelete(id);
  }

  async updateOne(id: Types.ObjectId, updateCategoryDto: ICommonObj) {
    const category = await this.findOne(id.toString());
    if (!category) throw new NotFoundException('Không tìm thấy danh mục này');
    await category.updateOne(updateCategoryDto);
    return category;
  }

  async findCategoryByGender(gender: Gender) {
    const categories = await this.categoryModel.find();
    const categoryId = categories.find((c) => {
      if (gender === Gender.MALE && c.name === 'Nam') return c._id;
      if (gender === Gender.FEMALE && c.name === 'Nữ') return c._id;
      return null;
    });
    return categoryId?._id;
  }
}
