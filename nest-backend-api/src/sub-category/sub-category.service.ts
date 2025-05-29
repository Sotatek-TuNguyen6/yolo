import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { SubCategory } from './entities/sub-category.entity';
import { IAllQuery } from 'src/interface/common.interface';
import { handleQuery } from 'src/utils/pagination.util';

const populate = ['categoryParents'];

@Injectable()
export class SubCategoryService {
  constructor(
    @InjectModel(SubCategory.name)
    private subCategoryModel: Model<SubCategory>,
  ) {}

  async create(createSubCategoryDto: Partial<SubCategory>) {
    return this.subCategoryModel.create(createSubCategoryDto);
  }

  async findAll(query: IAllQuery) {
    const { filters, limit, skip, select, sort } = handleQuery(query);
    const subCategories = await this.subCategoryModel
      .find(filters)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select(select)
      .populate(populate);

    const total = await this.subCategoryModel
      .find(filters)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .countDocuments();

    return {
      subCategories,
      total,
    };
  }

  findOne(id: string) {
    return this.subCategoryModel.findById(id);
  }

  async findByCategory(categoryId: string) {
    return this.subCategoryModel
      .find({
        categoryParents: categoryId,
      })
      .populate(populate);
  }

  update(id: string, updateSubCategoryDto: Partial<SubCategory>) {
    return this.subCategoryModel.findByIdAndUpdate(id, updateSubCategoryDto, {
      new: true,
    });
  }

  remove(id: string) {
    return this.subCategoryModel.findByIdAndDelete(id);
  }
}
