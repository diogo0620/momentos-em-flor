import Link from "next/link";
import { LegalPage, LegalSection } from "@/components/legal/LegalPage";
import { legalBusiness, legalLastUpdated } from "@/lib/legal/business";

export const metadata = { title: "Política de Privacidade | Momentos em Flor" };

export default function PrivacyPage() {
    const controller = legalBusiness.legalName || legalBusiness.brandName;
    return (
        <LegalPage eyebrow={`Atualizada em ${legalLastUpdated}`} title="Política de Privacidade" intro="Como recolhemos, utilizamos e protegemos os dados pessoais na Momentos em Flor.">
            <LegalSection title="1. Responsável pelo tratamento">
                <p>O responsável pelo tratamento é {controller}{legalBusiness.taxNumber ? `, NIF ${legalBusiness.taxNumber}` : ""}{legalBusiness.address ? `, com morada em ${legalBusiness.address}` : ""}.</p>
                <p>Questões sobre privacidade e pedidos de exercício de direitos podem ser enviados para {legalBusiness.email ? <a className="font-medium text-[#55624A] underline" href={`mailto:${legalBusiness.email}`}>{legalBusiness.email}</a> : "o contacto de apoio publicado na loja"}.</p>
            </LegalSection>

            <LegalSection title="2. Dados tratados">
                <p>Podemos tratar dados de conta e contacto, morada e contacto do destinatário, dados da encomenda, NIF, referências de pagamento, coordenadas derivadas da morada, comunicações, avaliações e registos técnicos necessários à segurança do serviço.</p>
                <p>Os dados completos do cartão são recolhidos e processados diretamente pelo prestador de pagamentos e não são armazenados pela Momentos em Flor.</p>
            </LegalSection>

            <LegalSection title="3. Finalidades e fundamentos">
                <p>Tratamos dados para criar e gerir contas, celebrar e executar encomendas, entregar produtos, processar pagamentos e reembolsos, emitir documentos fiscais, prestar apoio, prevenir fraude e proteger a plataforma.</p>
                <p>Os fundamentos aplicáveis incluem a execução do contrato, o cumprimento de obrigações legais, interesses legítimos de segurança e melhoria do serviço e, quando exigido, o consentimento. O consentimento pode ser retirado a qualquer momento, sem afetar o tratamento anterior.</p>
            </LegalSection>

            <LegalSection title="4. Destinatários e prestadores">
                <p>Partilhamos apenas os dados estritamente necessários com parceiros operacionais envolvidos na preparação e entrega, bem como com prestadores de pagamento, faturação, email, alojamento, armazenamento e geocodificação. Estes podem incluir Stripe, Moloni, Resend, Supabase e Google Maps, de acordo com a configuração ativa do serviço.</p>
                <p>Não vendemos dados pessoais. Quando um prestador tratar dados fora do Espaço Económico Europeu, serão aplicadas as garantias legalmente exigidas.</p>
            </LegalSection>

            <LegalSection title="5. Conservação e segurança">
                <p>Os dados são conservados apenas durante o período necessário à finalidade e aos prazos legais aplicáveis, incluindo obrigações fiscais, contabilísticas e de defesa de direitos. Credenciais e ligações de recuperação têm validade limitada e são protegidas por medidas técnicas adequadas.</p>
            </LegalSection>

            <LegalSection title="6. Os seus direitos">
                <p>Pode pedir acesso, retificação, apagamento, limitação, oposição e portabilidade, nos termos aplicáveis, bem como retirar consentimentos. Responderemos dentro do prazo legal e poderemos pedir prova de identidade adequada.</p>
                <p>Pode também apresentar reclamação à <a href="https://www.cnpd.pt/" target="_blank" rel="noreferrer" className="font-medium text-[#55624A] underline">Comissão Nacional de Proteção de Dados</a>.</p>
            </LegalSection>

            <LegalSection title="7. Dados de terceiros e tecnologias locais">
                <p>Ao indicar dados do destinatário, o cliente declara que está autorizado a fazê-lo e deve informá-lo de que esses dados serão usados para a entrega. A utilização de cookies e armazenamento local é explicada na <Link href="/cookies" className="font-medium text-[#55624A] underline">Política de Cookies</Link>.</p>
            </LegalSection>
        </LegalPage>
    );
}
