import { IRequest } from './IRequest';

export interface UseCase<TResponse = void> {
  execute(request?: IRequest): Promise<TResponse>;
}