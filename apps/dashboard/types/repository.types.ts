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

export interface IBaseRepository<T> {
  findById(id: string, options?: BaseFindOptions): Promise<T | null>;
  findMany(options?: FindManyOptions): Promise<T[]>;
  findFirst(options?: FindManyOptions): Promise<T | null>;
  create(data: any): Promise<T>;
  createMany(data: any[]): Promise<{ count: number }>;
  update(id: string, data: any): Promise<T>;
  updateMany(where: any, data: any): Promise<{ count: number }>;
  delete(id: string): Promise<T>;
  deleteMany(where: any): Promise<{ count: number }>;
  count(where?: any): Promise<number>;
  exists(where: any): Promise<boolean>;
}
