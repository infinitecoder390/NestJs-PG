import { BadRequestException, Logger } from '@nestjs/common';
import {
  DeepPartial,
  Equal,
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  ILike,
  In,
  Repository,
} from 'typeorm';
import { CommonRepository, QueryResponse } from '../interface/common.interface';
import { CommonMethods } from '../utils/common-methods';

export class CommonRepositoryImpl<T, FilterQueryDto>
  implements CommonRepository<T, FilterQueryDto>
{
  constructor(
    private readonly repo: Repository<T>,
    private readonly repoLogger: Logger,
  ) {}

  async findAll(
    skip?: number,
    take?: number,
    paginate: boolean = false,
  ): Promise<QueryResponse<T>> {
    try {
      this.repoLogger.debug('findAll');
      const findOptions: FindManyOptions<T> = {
        where: {
          is_active: true,
          is_deleted: false,
        } as unknown as FindOptionsWhere<T>,
        take: take || undefined,
        skip: skip || undefined,
      };
      const [data, total] = await Promise.all([
        this.repo.find(findOptions),
        this.repo.count(findOptions),
      ]);
      if (paginate && skip && take) {
        return {
          total,
          skip: skip || 0,
          limit: take || 0,
          data,
        };
      } else {
        return {
          total,
          data,
        };
      }
    } catch (error) {
      this.repoLogger.error(`find all error, ${error}`);
      throw error;
    }
  }

  async findOneByQuery(
    filterQuery: FilterQueryDto,
    relations?: string[],
  ): Promise<T> {
    try {
      this.repoLogger.debug(`findOneByQuery, ${filterQuery}`);
      const findOptions: FindManyOptions<T> = {
        where: {
          ...filterQuery,
          is_active: true,
          is_deleted: false,
        } as FindOptionsWhere<T>,
        relations,
      };
      return await this.repo.findOne(findOptions);
    } catch (error) {
      this.repoLogger.error(`findOneByQuery error, ${error}`);
      throw error;
    }
  }

  async findOneByQueryCondition(
    filterQuery: FilterQueryDto,
    searchQuery?: string,
    searchColumns?: string[],
    projectionColumns?: string[],
    sortingColumns?: string[],
    order?: number,
    relations?: string[],
  ): Promise<T | undefined> {
    try {
      this.repoLogger.debug(
        `findOneByQueryCondition filterQuery: ${JSON.stringify(filterQuery)}`,
      );
      this.repoLogger.debug(
        `findOneByQueryCondition searchQuery: ${searchQuery}`,
      );
      this.repoLogger.debug(
        `findOneByQueryCondition searchColumns: ${searchColumns}`,
      );
      this.repoLogger.debug(
        `findOneByQueryCondition projectionColumns: ${projectionColumns}`,
      );
      this.repoLogger.debug(
        `findOneByQueryCondition sortingColumns: ${sortingColumns}`,
      );
      this.repoLogger.debug(`findOneByQueryCondition order: ${order}`);

      // Initialize dynamic query conditions
      let dynamicQueryConditions: any = {};

      // Build dynamic query conditions from filterQuery
      for (const key in filterQuery) {
        if (filterQuery[key] !== undefined) {
          dynamicQueryConditions[key] = filterQuery[key];
        }
      }

      // Handle search functionality
      if (searchQuery && searchColumns) {
        dynamicQueryConditions = searchColumns
          .map((column) => {
            return { [column]: ILike(`%${searchQuery}%`) };
          })
          .reduce(
            (prev, curr) => ({ ...prev, ...curr }),
            dynamicQueryConditions,
          );
      }

      // Prepare the find options
      const findOptions: any = {
        where: dynamicQueryConditions,
        relations,
      };

      // Handle projection columns
      if (projectionColumns && projectionColumns.length > 0) {
        findOptions.select = projectionColumns;
      }

      // Handle sorting
      if (sortingColumns && sortingColumns.length > 0) {
        findOptions.order = {};
        sortingColumns.forEach((column) => {
          findOptions.order[column] = order === 1 ? 'ASC' : 'DESC';
        });
      }

      this.repoLogger.debug(
        `findOneByQueryCondition findOptions: ${JSON.stringify(findOptions)}`,
      );

      // Execute the query
      return await this.repo.findOne(findOptions);
    } catch (error) {
      this.repoLogger.error(`findOneByQueryCondition error: ${error}`);
      throw error;
    }
  }

  async findOneByOptions(query: FindOneOptions): Promise<T> {
    try {
      this.repoLogger.debug(`FindOneByOptions , ${query}`);
      return await this.repo.findOne(query);
    } catch (error) {
      this.repoLogger.error(`findOneBy id error, ${error}`);
      throw error;
    }
  }

  async findOneById(id: string | number, relations: string[] = []): Promise<T> {
    try {
      this.repoLogger.debug(`findOneBy id , ${id}`);
      const findOptions: FindManyOptions<T> = {
        where: {
          id,
          is_active: true,
          is_deleted: false,
        } as unknown as FindOptionsWhere<T>,
        relations,
      };
      return await this.repo.findOne(findOptions);
    } catch (error) {
      this.repoLogger.error(`findOneBy id error, ${error}`);
      throw error;
    }
  }

  async createOne(item: DeepPartial<T>): Promise<T> {
    try {
      this.repoLogger.debug(`createOne item: ${JSON.stringify(item)}`);
      return this.repo.save(item);
    } catch (error) {
      this.repoLogger.error(`createOne error: ${error}`);
      throw error;
    }
  }

  async upsert(item: DeepPartial<T>, uniqueColumns: (keyof T)[]): Promise<T> {
    try {
      this.repoLogger.debug(`createOne item: ${JSON.stringify(item)}`);
      const upsertResult = await this.repo.upsert(
        item as any,
        uniqueColumns as any[],
      );
      return upsertResult.generatedMaps[0] as T;
    } catch (error) {
      this.repoLogger.error(`createOne error: ${error}`);
      throw error;
    }
  }

  async createBulk(items: DeepPartial<T>[]): Promise<T[]> {
    try {
      this.repoLogger.debug(`createBulk items: ${JSON.stringify(items)}`);
      return await this.repo.save(items);
    } catch (error) {
      this.repoLogger.error(`createBulk error: ${error}`);
      throw error;
    }
  }

  async updateOne(
    id: string | number,
    item: DeepPartial<T>,
    relations: string[] = [],
  ): Promise<T> {
    try {
      this.repoLogger.debug(`updateOne id: ${id}`);
      this.repoLogger.debug(`updateOne item: ${JSON.stringify(item)}`);
      // await this.repo.update(id, item as any);
      await this.repo.save({ id, ...item } as any);
      return this.findOneById(id, relations);
    } catch (error) {
      this.repoLogger.error(`updateOne error: ${error}`);
      throw error;
    }
  }

  async updateOneByCondition(
    condition: Partial<T>,
    item: DeepPartial<T>,
  ): Promise<T> {
    try {
      this.repoLogger.debug(
        `updateOne condition: ${JSON.stringify(condition)}`,
      );
      this.repoLogger.debug(`updateOne item: ${JSON.stringify(item)}`);

      // await this.repo.update(condition as any, item as any);
      const entity = await this.repo.findOneBy(condition as any);
      if (!entity) throw new Error('Entity not found');
      await this.repo.save({ ...entity, ...item });

      const updatedEntity = await this.repo.findOne({
        where: condition,
      } as any);
      return updatedEntity;
    } catch (error) {
      this.repoLogger.error(`updateOne error: ${error}`);
      throw error;
    }
  }

  async updateBulk(items: DeepPartial<T>[]): Promise<T[]> {
    try {
      this.repoLogger.debug(`updateBulk items: ${JSON.stringify(items)}`);
      const updatedItems = await Promise.all(
        items.map(async (item: any) => {
          const id = item?.id;
          if (!id) {
            throw new Error('Item must have an id to update');
          }
          // await this.repo.update(id, item as any);
          await this.repo.save({ id, ...item } as any);
          return this.repo.findOne({ where: { id: id } } as any);
        }),
      );
      return updatedItems;
    } catch (error) {
      this.repoLogger.error(`updateBulk error: ${error}`);
      throw error;
    }
  }

  async deleteOne(id: string): Promise<void> {
    try {
      this.repoLogger.debug(`deleteOne id: ${id}`);
      await this.repo.delete(id);
    } catch (error) {
      this.repoLogger.error(`deleteOne error: ${error}`);
      throw error;
    }
  }

  async deleteByCondition(condition: any): Promise<void> {
    try {
      this.repoLogger.debug(
        `deleteByCondition with condition: ${JSON.stringify(condition)}`,
      );

      const result = await this.repo.delete(condition);

      if (result.affected === 0) {
        this.repoLogger.warn(
          `No records deleted with condition: ${JSON.stringify(condition)}`,
        );
      } else {
        this.repoLogger.debug(
          `Successfully deleted record(s) with condition: ${JSON.stringify(condition)}`,
        );
      }
    } catch (error) {
      this.repoLogger.error(`deleteByCondition error: ${error}`);
      throw error;
    }
  }

  async findByIds(
    ids: (string | number)[],
    relations: string[] = [],
  ): Promise<T[]> {
    try {
      this.repoLogger.debug(`findByIds, ${ids}`);
      const findOptions: FindManyOptions<T> = {
        where: {
          id: In(ids),
          is_active: true,
          is_deleted: false,
        } as unknown as FindOptionsWhere<T>,
        relations,
      };
      return await this.repo.find(findOptions);
    } catch (error) {
      this.repoLogger.error(`findByIds error, ${error}`);
      throw error;
    }
  }

  async softDeleteOneByQuery(condition: any): Promise<T> {
    try {
      const existingItem = await this.findOneByQuery(condition);
      if (!existingItem) {
        throw new BadRequestException(CommonMethods.getErrorMsg('E_1011'));
      }
      const updatedItem = await this.repo.save({
        ...existingItem,
        is_deleted: true,
        is_active: false,
      });
      return updatedItem;
    } catch (error) {
      this.repoLogger.error(`softDeleteOne error: ${error}`);
      throw error;
    }
  }
  async findByQuery(
    filterQuery: FilterQueryDto,
    page?: number,
    limit?: number,
    searchQuery?: string,
    searchColumns?: string[],
    projectionColumns?: string[],
    sortingColumns?: string[],
    order?: number,
    pageOff: boolean = false,
    relations?: string[],
  ): Promise<QueryResponse<T>> {
    try {
      this.repoLogger.debug(
        `findByQuery filterQuery: ${JSON.stringify(filterQuery)}`,
      );
      this.repoLogger.debug(`findByQuery page: ${page}`);
      this.repoLogger.debug(`findByQuery limit: ${limit}`);
      this.repoLogger.debug(`findByQuery searchQuery: ${searchQuery}`);
      this.repoLogger.debug(`findByQuery searchColumns: ${searchColumns}`);
      this.repoLogger.debug(
        `findByQuery projectionColumns: ${projectionColumns}`,
      );
      this.repoLogger.debug(`findByQuery sortingColums: ${sortingColumns}`);
      this.repoLogger.debug(`findByQuery order: ${order}`);
      this.repoLogger.debug(`findByQuery pageOff: ${pageOff}`);

      let dynamicQueryConditions: any = {};
      let skip = 0;
      for (const key in filterQuery) {
        if (filterQuery[key] !== undefined) {
          dynamicQueryConditions[key] = filterQuery[key];
        }
      }
      // if (searchQuery && searchColumns) {
      //   dynamicQueryConditions = searchColumns.map((column) => ({
      //     [column]: ILike(`%${searchQuery}%`),
      //     ...dynamicQueryConditions,
      //   }));
      // }

      if (searchQuery && searchColumns) {
        dynamicQueryConditions = searchColumns
          .map((column) => {
            if (column == 'email') {
              return {
                [column]: Equal(`${searchQuery}`),
                ...dynamicQueryConditions,
              };
            } else {
              return {
                [column]: ILike(`%${searchQuery}%`),
                ...dynamicQueryConditions,
              };
            }
          })
          .filter(Boolean);
      }
      const findOptions: any = {
        where: dynamicQueryConditions,
        relations,
      };
      if (projectionColumns && projectionColumns.length > 0) {
        findOptions.select = projectionColumns;
      }
      if (!pageOff) {
        page = page || 1;
        limit = limit || 10;
        skip = (page - 1) * limit;
        findOptions.skip = skip;
        findOptions.take = limit;
      }
      if (sortingColumns && sortingColumns.length > 0) {
        findOptions.order = {};
        sortingColumns.forEach((column) => {
          const [relation, columnAlias] = column.split('.');

          if (columnAlias && relations.includes(relation)) {
            findOptions.order[relation] = {
              [columnAlias]: order === 1 ? 'ASC' : 'DESC',
            };
          } else {
            findOptions.order[column] = order === 1 ? 'ASC' : 'DESC';
          }
        });
      }
      this.repoLogger.debug(
        `findByQuery findOptions: ${JSON.stringify(findOptions)}`,
      );
      const [data, total] = await this.repo.findAndCount(findOptions);
      // const data = await this.repo.find(findOptions);
      if (!pageOff) {
        return {
          total,
          skip: findOptions?.skip || 0,
          page,
          limit,
          data,
        };
      } else {
        return {
          data,
        };
      }
    } catch (error) {
      this.repoLogger.error(`findByQuery error: ${error}`);
      throw error;
    }
  }

  async findCountByQuery(filterQuery: FilterQueryDto): Promise<number> {
    try {
      this.repoLogger.debug(
        `findCountByQuery filterQuery: ${JSON.stringify(filterQuery)}`,
      );
      const dynamicQueryConditions: any = {};
      for (const key in filterQuery) {
        if (filterQuery[key] !== undefined) {
          dynamicQueryConditions[key] = filterQuery[key];
        }
      }
      const findOptions: any = {
        where: dynamicQueryConditions,
      };
      this.repoLogger.debug(
        `findCountByQuery findOptions: ${JSON.stringify(findOptions)}`,
      );
      const count = await this.repo.count(findOptions);
      return count;
    } catch (error) {
      this.repoLogger.error(`findCountByQuery error: ${error}`);
      throw error;
    }
  }

  async search(
    searchString: string,
    columns: string[],
    projectionColumns?: string[],
    sortingColums?: string[],
    order?: number,
  ): Promise<T[]> {
    try {
      this.repoLogger.debug(`search searchString: ${searchString}`);
      this.repoLogger.debug(`search columns: ${columns}`);
      this.repoLogger.debug(`search projectionColumns: ${projectionColumns}`);
      const searchQuery = `%${searchString}%`;
      const searchConditions: any = {};
      if (Array.isArray(columns)) {
        columns.forEach((column) => {
          searchConditions[column] = ILike(searchQuery);
        });
      }
      const sortOptions: any = {};
      if (sortingColums && sortingColums.length > 0 && order) {
        sortingColums.forEach((column) => {
          sortOptions[column] = order === 1 ? 'ASC' : 'DESC';
        });
      }
      const projection: any = {};
      if (projectionColumns.length > 0) {
        projection.select = projectionColumns;
      }

      this.repoLogger.debug(
        `search searchConditions: ${JSON.stringify(searchConditions)}`,
      );
      this.repoLogger.debug(`search projection: ${JSON.stringify(projection)}`);
      this.repoLogger.debug(
        `search sortOptions: ${JSON.stringify(sortOptions)}`,
      );

      return this.repo.find({
        where: searchConditions,
        ...projection,
        order: sortOptions,
      });
    } catch (error) {
      this.repoLogger.error(`search error: ${error}`);
      throw error;
    }
  }

  async executeRawQuery(query: string, parameters: any[] = []): Promise<any[]> {
    try {
      this.repoLogger.debug(`executeRawQuery query: ${query}`);
      this.repoLogger.debug(
        `executeRawQuery parameters: ${JSON.stringify(parameters)}`,
      );
      const result = await this.repo.query(query, parameters);
      return result;
    } catch (error) {
      this.repoLogger.error(`executeRawQuery error: ${error}`);
      throw error;
    }
  }
}
