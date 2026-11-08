import Link from "next/link";
import { LegalPage, LegalSection } from "@/components/legal/LegalPage";
import { legalBusiness, legalLastUpdated } from "@/lib/legal/business";

export const metadata = { title: "Termos e Condições | Momentos em Flor" };

export default function TermsPage() {
    return (
        <LegalPage eyebrow={`Atualizado em ${legalLastUpdated}`} title="Termos e Condições" intro="As condições aplicáveis à utilização da loja e às encomendas realizadas na Momentos em Flor.">
            <LegalSection title="1. Identificação e âmbito">
                <p>A loja Momentos em Flor é explorada por {legalBusiness.legalName || "a entidade identificada nos contactos da loja"}{legalBusiness.taxNumber ? `, NIF ${legalBusiness.taxNumber}` : ""}{legalBusiness.address ? `, com morada em ${legalBusiness.address}` : ""}. Estes termos aplicam-se às compras efetuadas neste site.</p>
                {legalBusiness.email && <p>Contacto: <a className="font-medium text-[#55624A] underline" href={`mailto:${legalBusiness.email}`}>{legalBusiness.email}</a>{legalBusiness.phone ? ` · ${legalBusiness.phone}` : ""}.</p>}
            </LegalSection>

            <LegalSection title="2. Produtos e imagens">
                <p>Os produtos florais são preparados artesanalmente com elementos naturais. As fotografias são meramente ilustrativas: tonalidades, variedades, dimensões e composição podem apresentar diferenças naturais ou sazonais.</p>
                <p>Quando um elemento não estiver disponível, poderá ser substituído por outro de valor e estilo equivalentes, preservando a intenção visual do produto. Uma alteração substancial será comunicada ao cliente sempre que possível.</p>
            </LegalSection>

            <LegalSection title="3. Encomenda, preço e pagamento">
                <p>Antes do pagamento são apresentados os produtos, impostos, taxa de entrega e total. A encomenda só entra em processamento após confirmação do pagamento. A fatura é emitida com os dados indicados pelo cliente.</p>
                <p>Uma confirmação automática de pagamento não elimina a necessidade de validação operacional. Em situações excecionais e objetivas — nomeadamente indisponibilidade imprevisível de flores frescas, limitações de capacidade, cobertura de entrega ou força maior — poderemos não conseguir executar a encomenda.</p>
                <p>Nesse caso, o cliente será informado com brevidade e receberá o reembolso integral do montante pago, pelo mesmo meio sempre que possível e sem demora injustificada.</p>
            </LegalSection>

            <LegalSection title="4. Área e condições de entrega">
                <p>Nesta fase, as entregas estão limitadas a Santa Maria da Feira e arredores. A morada é validada durante o checkout segundo a área configurada na loja. Uma indicação positiva depende da exatidão da morada fornecida.</p>
                <p>As datas e períodos escolhidos representam a janela prevista de entrega, podendo existir pequenos ajustamentos por trânsito, condições meteorológicas ou outras circunstâncias operacionais. O cliente deve garantir que existe alguém disponível para receber a encomenda e facultar contactos corretos.</p>
                <p>Consulta os detalhes na <Link href="/delivery-policy" className="font-medium text-[#55624A] underline">Política de Entregas</Link>.</p>
            </LegalSection>

            <LegalSection title="5. Alterações e cancelamento">
                <p>O cliente pode pedir o cancelamento enquanto a opção estiver disponível na área de encomendas. Depois de iniciada a preparação, a aceitação do pedido dependerá do estado efetivo da encomenda.</p>
                <p>Por se tratarem de bens perecíveis e, em muitos casos, preparados segundo especificações do cliente, o direito de livre resolução pode não ser aplicável nos casos previstos na lei. Isto não limita os direitos do consumidor perante falta de conformidade, dano ou erro na entrega.</p>
            </LegalSection>

            <LegalSection title="6. Reclamações, reembolsos e litígios">
                <p>Qualquer problema deve ser comunicado através dos contactos da loja, indicando o número da encomenda e, quando relevante, fotografias do produto recebido.</p>
                <p>O consumidor pode usar o <a href={legalBusiness.complaintsUrl} target="_blank" rel="noreferrer" className="font-medium text-[#55624A] underline">Livro de Reclamações Eletrónico</a>.{legalBusiness.ralName && legalBusiness.ralUrl ? <> Pode ainda recorrer a <a href={legalBusiness.ralUrl} target="_blank" rel="noreferrer" className="font-medium text-[#55624A] underline">{legalBusiness.ralName}</a>, entidade de resolução alternativa de litígios competente.</> : " A entidade de resolução alternativa de litígios competente será indicada nos dados legais da loja."}</p>
            </LegalSection>

            <LegalSection title="7. Privacidade e alterações">
                <p>O tratamento de dados pessoais é explicado na <Link href="/privacy" className="font-medium text-[#55624A] underline">Política de Privacidade</Link>. Estes termos podem ser atualizados por motivos legais ou operacionais; aplica-se a versão aceite no momento da encomenda.</p>
            </LegalSection>
        </LegalPage>
    );
}
