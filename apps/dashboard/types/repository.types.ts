export interface BaseFindOptions {
  include?: any;
  select?: any;
}

export interface FindManyOptions extends BaseFindOptions {
  skip?: number;
  take?: number;
  where?: any;
  orderBy?: any;
  cursor?: any;
  distinct?: any;
}

export interface IBaseRepository<T, MappedType> {
  findById(id: string, options?: BaseFindOptions): Promise<T | MappedType | null>;
  findMany(options?: FindManyOptions): Promise<T[] | MappedType[]>;
  findFirst(options?: FindManyOptions): Promise<T | MappedType | null>;
  create(data: any): Promise<T | MappedType>;
  createMany(data: any[]): Promise<{ count: number }>;
  update(id: number | string, data: any): Promise<T | MappedType>;
  updateMany(where: any, data: any): Promise<{ count: number }>;
  delete(id: string): Promise<T | MappedType>;
  deleteMany(where: any): Promise<{ count: number }>;
  count(where?: any): Promise<number>;
  exists(where: any): Promise<boolean>;
}
