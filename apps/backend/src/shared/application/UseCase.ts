import { IRequest } from './IRequest';

export interface UseCase<TResponse, IRequest = void> {
  execute(request: IRequest): Promise<TResponse>;
}