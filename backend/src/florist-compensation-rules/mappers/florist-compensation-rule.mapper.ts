import { FloristCompensationRuleResponseDto } from '../dto/florist-compensation-rule-response.dto';

export class FloristCompensationRuleMapper {
    toResponse(
        rule: any,
    ): FloristCompensationRuleResponseDto {
        return {
            id: rule.id,
            productId: rule.productId,
            floristId: rule.floristId,
            compensationAmount: Number(rule.compensationAmount),
            active: rule.active,
            createdAt: rule.createdAt,
            updatedAt: rule.updatedAt,
            product: {
                id: rule.product.id,
                name: rule.product.name,
                slug: rule.product.slug,
            },
            florist: rule.florist
                ? {
                    id: rule.florist.id,
                    name: rule.florist.name,
                }
                : null,
        };
    }

    toResponses(
        rules: any[],
    ): FloristCompensationRuleResponseDto[] {
        return rules.map((rule) =>
            this.toResponse(rule),
        );
    }
}