import Link from "next/link";
import { LegalPage, LegalSection } from "@/components/legal/LegalPage";
import { legalBusiness, legalLastUpdated } from "@/lib/legal/business";

export const metadata = { title: "Reclamações e litígios | Momentos em Flor" };

export default function DisputesPage() {
  return <LegalPage eyebrow={`Atualizada em ${legalLastUpdated}`} title="Reclamações e resolução de litígios" intro="Canais claros para comunicar um problema, acompanhar a resposta e recorrer a mecanismos independentes.">
    <LegalSection title="1. Apoio e reclamação direta"><p>Para uma resolução mais rápida, contacta o apoio através da <Link href="/contact" className="font-medium text-[#55624A] underline">página de contactos</Link> ou abre um pedido na área de cliente. Inclui o número da encomenda, os factos relevantes e a solução pretendida.</p><p>As comunicações associadas a uma conta ficam registadas no pedido de suporte, permitindo acompanhar o histórico e as respostas.</p></LegalSection>
    <LegalSection title="2. Livro de Reclamações"><p>Podes apresentar uma reclamação no <a href={legalBusiness.complaintsUrl} target="_blank" rel="noreferrer" className="font-medium text-[#55624A] underline">Livro de Reclamações Eletrónico</a>. Este canal não impede o contacto direto nem o recurso a outros meios legalmente disponíveis.</p></LegalSection>
    <LegalSection title="3. Resolução alternativa de litígios"><p>Em caso de litígio de consumo, podes recorrer à entidade de resolução alternativa de litígios competente.</p>{legalBusiness.ralName && legalBusiness.ralUrl ? <p>Entidade indicada: <a href={legalBusiness.ralUrl} target="_blank" rel="noreferrer" className="font-medium text-[#55624A] underline">{legalBusiness.ralName}</a>.</p> : <p>A identificação e ligação da entidade competente serão apresentadas aqui após confirmação dos dados legais e da área geográfica da empresa. Até lá, consulta a <a href="https://www.consumidor.gov.pt/" target="_blank" rel="noreferrer" className="font-medium text-[#55624A] underline">Direção-Geral do Consumidor</a>.</p>}</LegalSection>
    <LegalSection title="4. Plataforma europeia ODR"><p>A antiga Plataforma Europeia de Resolução de Litígios em Linha foi descontinuada em 20 de julho de 2025. Por esse motivo, não apresentamos uma ligação obsoleta para submissão de reclamações nessa plataforma.</p></LegalSection>
    <LegalSection title="5. Tribunais"><p>Os mecanismos de apoio e resolução alternativa não eliminam o direito de recorrer aos tribunais competentes, nos termos da lei.</p></LegalSection>
  </LegalPage>;
}
