import { ProductVariantType } from '@prisma/client';

type ConfigurableOrderItem = {
  variantType?: ProductVariantType | null;
  variantName?: string | null;
  components?: Array<{
    componentName: string;
    quantity: number;
  }>;
};

const VARIANT_LABELS: Record<ProductVariantType, string> = {
  [ProductVariantType.SIZE]: 'Tamanho',
};

export function formatOrderItemConfiguration(item: ConfigurableOrderItem): string | null {
  const values: string[] = [];

  if (item.variantName) {
    const label = item.variantType
      ? VARIANT_LABELS[item.variantType]
      : 'Variante';
    values.push(`${label}: ${item.variantName}`);
  }

  for (const component of item.components ?? []) {
    values.push(`${component.componentName}: ${component.quantity}`);
  }

  return values.length > 0 ? values.join(' · ') : null;
}
