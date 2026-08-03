import { PartialType } from '@nestjs/swagger';

import { CreateFloristDto } from './create-florist.dto';

export class UpdateFloristDto extends PartialType(
  CreateFloristDto,
) {}