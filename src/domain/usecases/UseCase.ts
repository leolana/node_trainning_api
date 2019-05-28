export interface IUseCase<T> {
  execute(type: T): Promise<any>;
}
