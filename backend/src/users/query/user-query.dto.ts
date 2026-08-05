import { PaginationQueryDto } from '@/common/query/pagination-query.dto';

export class UserQueryDto extends PaginationQueryDto {
  override sort = 'firstName';
}