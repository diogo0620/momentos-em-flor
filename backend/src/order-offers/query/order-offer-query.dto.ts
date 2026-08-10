import { PaginationQueryDto } from '@/common/query/pagination-query.dto';

export class OrderOfferQueryDto
  extends PaginationQueryDto {
  override sort = 'createdAt';
}