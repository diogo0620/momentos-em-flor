export interface IRepository<
  TEntity,
  TCreate,
  TUpdate,
> {
  findAll(): Promise<TEntity[]>;

  findById(id: number): Promise<TEntity | null>;

  create(data: TCreate): Promise<TEntity>;

  update(id: number, data: TUpdate): Promise<TEntity>;

  delete(id: number): Promise<TEntity>;
}