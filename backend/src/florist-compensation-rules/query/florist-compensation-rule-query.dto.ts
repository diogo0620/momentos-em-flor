import { PaginationQueryDto } from '@/common/query/pagination-query.dto';

export class FloristCompensationRuleQueryDto extends PaginationQueryDto {
  override sort = 'productId';
}