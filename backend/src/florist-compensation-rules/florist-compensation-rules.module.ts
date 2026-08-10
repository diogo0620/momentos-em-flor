import { Module } from '@nestjs/common';

import { PrismaModule } from '@/prisma/prisma.module';

import { FloristCompensationRulesService } from './florist-compensation-rules.service';
import { FloristCompensationRulesController } from './florist-compensation-rules.controller';
import { FloristCompensationRuleMapper } from './mappers/florist-compensation-rule.mapper';

@Module({
    imports: [PrismaModule],
    controllers: [
        FloristCompensationRulesController,
    ],
    providers: [FloristCompensationRulesService, FloristCompensationRuleMapper],
    exports: [FloristCompensationRulesService],
})
export class FloristCompensationRulesModule { }