import { PartialType } from '@nestjs/swagger';

import { CreateFloristCompensationRuleDto } from './create-florist-compensation-rule.dto';

export class UpdateFloristCompensationRuleDto extends PartialType(
  CreateFloristCompensationRuleDto,
) {}