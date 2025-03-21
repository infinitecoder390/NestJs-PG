import { DeepPartial } from 'typeorm';
export interface QueryResponse<T> {
  total?: number;
  skip?: number;
  limit?: number;
  page?: number;
  data: T[];
}
export interface CommonRepository<T, FilterQueryDto> {
  findAll(
    skip?: number,
    take?: number,
    paginate?: boolean,
  ): Promise<QueryResponse<T>>;
  findOneById(id: string): Promise<T>;
  findOneByQuery(filterQuery: FilterQueryDto): Promise<T>;
  createOne(item: DeepPartial<T>): Promise<T>;
  updateOne(id: string, item: DeepPartial<T>): Promise<T>;
  deleteOne(id: string): Promise<void>;
  findCountByQuery(filterQuery: FilterQueryDto): Promise<number>;
  findByQuery(
    filterQuery: FilterQueryDto,
    skip?: number,
    take?: number,
    searchQuery?: string,
    searchColumns?: string[],
    projectionColumns?: string[],
    sortingColums?: string[],
    order?: number,
    paginate?: boolean,
  ): Promise<QueryResponse<T>>;
}

interface DropdownOption {
  key: any;
  value: any;
}

interface ExcelColumnConfig {
  header: string;
  key: string;
  width?: number;
  dropdownOptions?: DropdownOption[];
  multiSelect?: boolean;
}

export interface ExcelSheetConfig {
  sheetName: string;
  columns: ExcelColumnConfig[];
  rowCount: number;
}
