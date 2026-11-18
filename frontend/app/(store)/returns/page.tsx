import Link from "next/link";
import { LegalPage, LegalSection } from "@/components/legal/LegalPage";
import { legalLastUpdated } from "@/lib/legal/business";

export const metadata = { title: "Cancelamentos e reembolsos | Momentos em Flor" };

export default function ReturnsPage() {
  return <LegalPage eyebrow={`Atualizada em ${legalLastUpdated}`} title="Cancelamentos e reembolsos" intro="Como pedir uma alteração ou cancelamento e o que acontece quando existe um problema com a encomenda.">
    <LegalSection title="1. Pedidos de alteração ou cancelamento"><p>Podes pedir o cancelamento enquanto a opção estiver disponível nos detalhes da encomenda. Depois de iniciada a preparação, poderemos já não conseguir aceitar alterações ou cancelamentos.</p><p>O pedido só produz efeitos após confirmação. Se o cancelamento for aceite e o pagamento já tiver sido realizado, o reembolso é iniciado pelo meio de pagamento aplicável.</p></LegalSection>
    <LegalSection title="2. Bens perecíveis e personalizados"><p>As flores frescas são bens suscetíveis de se deteriorarem rapidamente. Além disso, algumas composições são preparadas segundo especificações do cliente ou claramente personalizadas. Nestes casos, o direito de livre resolução de 14 dias pode não ser aplicável nos termos legais.</p><p>Esta exclusão não reduz os direitos legais do consumidor quando o produto não esteja conforme, chegue danificado ou exista erro imputável à execução da encomenda.</p></LegalSection>
    <LegalSection title="3. Produto danificado, incorreto ou não conforme"><p>Contacta-nos logo que possível através do <Link href="/contact" className="font-medium text-[#55624A] underline">apoio ao cliente</Link>, indicando o número da encomenda, uma descrição objetiva e fotografias quando forem úteis. Analisaremos o caso e apresentaremos a solução legalmente adequada, que pode incluir substituição, redução do preço, reembolso ou outra solução aplicável.</p></LegalSection>
    <LegalSection title="4. Prazo e processamento do reembolso"><p>Depois de aprovado, o reembolso é processado sem demora injustificada. O tempo até ficar visível depende do prestador de pagamento e da instituição bancária. A confirmação e referência do reembolso ficam associadas ao registo da encomenda.</p></LegalSection>
    <LegalSection title="5. Reclamações"><p>Se não ficar satisfeito com a resolução, consulta os canais de <Link href="/disputes" className="font-medium text-[#55624A] underline">reclamação e resolução de litígios</Link>.</p></LegalSection>
  </LegalPage>;
}
