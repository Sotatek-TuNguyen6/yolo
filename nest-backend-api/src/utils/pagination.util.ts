import mongoose from 'mongoose';
import { IAllQuery } from 'src/interface/common.interface';
import { QueryParams } from 'src/types';

export interface PaginationResult {
  skip: number;
  limit: number;
  sortBy: 1 | -1;
}

/**
 * Xử lý phân trang và sắp xếp từ query params
 * @param query Object chứa thông tin phân trang và sắp xếp
 * @param defaultLimit Số lượng item mặc định trên mỗi trang
 * @returns Object chứa thông tin đã xử lý để dùng trong MongoDB query
 */
export function getPagination(
  query: QueryParams,
  defaultLimit: number = 10,
): PaginationResult {
  const page = query.page ? Math.max(1, Number(query.page)) : 1;
  const limit = query.limit ? Math.max(1, Number(query.limit)) : defaultLimit;
  const skip = (page - 1) * limit;
  const sortBy = query.sort === 'asc' ? 1 : -1;

  return { skip, limit, sortBy };
}

export const paginationQuery = (query: IAllQuery) => {
  const page = query?.page ? Math.max(1, Number(query.page)) : 1;
  const limit = query?.limit ? Math.max(1, Number(query.limit)) : 9;

  const skip = (page - 1) * limit;

  return { skip, limit };
};

export const sortQuery = (query: IAllQuery) => {
  if (query.sort) {
    return query.sort.split(',').join(' ');
  }
  return '-createdAt';
};

export const filtersQuery = (query: IAllQuery) => {
  const excludes = ['sort', 'limit', 'page', 'fields'];
  const newQuery = { ...query };
  for (const key in query) {
    if (excludes.includes(key)) delete newQuery[key];
  }

  const queryStr = JSON.stringify(newQuery);
  const newQueryStr = queryStr.replace(
    /\b(gte|gt|lte|lt)\b/g,
    (match) => `$${match}`,
  );

  return JSON.parse(newQueryStr) as Record<string, unknown>;
};

export const fieldsQuery = (query: IAllQuery) => {
  if (query.fields) {
    return query.fields.split(',').join(' ');
  }
  return '';
};

export const handleQuery = (query: IAllQuery) => {
  const filters = filtersQuery(query);
  const { skip, limit } = paginationQuery(query);
  const sort = sortQuery(query);
  const select = fieldsQuery(query);

  return {
    filters,
    skip,
    limit,
    sort,
    select,
  };
};

export const handleQueryProducts = (query: IAllQuery) => {
  const filters: Record<string, unknown> = {};
  // Helper to handle ObjectId arrays
  const handleObjectIdArray = (items: string[], field: string) => {
    const validIds = items
      .filter((id) => mongoose.Types.ObjectId.isValid(id))
      .map((id) => new mongoose.Types.ObjectId(id));
    if (validIds.length > 0) {
      filters[field] = { $in: validIds };
    }
  };

  // Apply filters
  if (query.categories?.length)
    handleObjectIdArray(query.categories, 'category');
  if (query.subCategories?.length)
    handleObjectIdArray(query.subCategories, 'subCategory');
  if (query.colors?.length) handleObjectIdArray(query.colors, 'colors');
  if (query.sizes?.length) handleObjectIdArray(query.sizes, 'sizes');

  // Ratings
  if (query.ratings?.length) {
    filters['ratingAverage'] = { $in: query.ratings.map(Number) };
  }

  // Prices
  if (query.prices?.length) {
    const mergedPriceFilter: Record<string, number> = {};
    query.prices.forEach((priceRange) => {
      for (const key in priceRange) {
        const mongoKey = key.replace(
          /\b(gte|gt|lte|lt)\b/g,
          (match) => `$${match}`,
        );
        mergedPriceFilter[mongoKey] = Number(priceRange[key]);
      }
    });

    if (Object.keys(mergedPriceFilter).length > 0) {
      filters['price'] = mergedPriceFilter;
    }
  }

  return filters;
};
