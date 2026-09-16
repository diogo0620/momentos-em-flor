import { FloristCompensationRuleResponseDto } from '../dto/florist-compensation-rule-response.dto';

export class FloristCompensationRuleMapper {

    toResponse(
        rule: any,
    ): FloristCompensationRuleResponseDto {
        return {
            id: rule.id,

            productId:
                rule.productId,

            variantId:
                rule.variantId,

            floristId:
                rule.floristId,

            compensationAmount:
                Number(
                    rule.compensationAmount,
                ),

            active:
                rule.active,

            createdAt:
                rule.createdAt,

            updatedAt:
                rule.updatedAt,

            product: {
                id:
                    rule.product.id,

                name:
                    rule.product.name,

                slug:
                    rule.product.slug,
            },

            variant: rule.variant
                ? {
                    id:
                        rule.variant.id,

                    type:
                        rule.variant.type,

                    name:
                        rule.variant.name,

                    code:
                        rule.variant.code,
                }
                : null,

            florist: rule.florist
                ? {
                    id:
                        rule.florist.id,

                    name:
                        rule.florist.name,
                }
                : null,
        };
    }

    toResponses(
        rules: any[],
    ): FloristCompensationRuleResponseDto[] {
        return rules.map(
            (rule) =>
                this.toResponse(rule),
        );
    }
}