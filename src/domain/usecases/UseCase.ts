export interface IUseCase<T, R> {
  execute(type: T): Promise<R>;
}
