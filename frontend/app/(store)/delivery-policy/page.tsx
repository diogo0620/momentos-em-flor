import { LegalPage, LegalSection } from "@/components/legal/LegalPage";
import { legalLastUpdated } from "@/lib/legal/business";

export const metadata = { title: "Política de Entregas | Momentos em Flor" };

export default function DeliveryPolicyPage() {
    return (
        <LegalPage eyebrow={`Atualizada em ${legalLastUpdated}`} title="Política de Entregas" intro="Área abrangida, preparação dos produtos e o que acontece em situações excecionais.">
            <LegalSection title="Área disponível">
                <p>Nesta fase, entregamos em Santa Maria da Feira e arredores. A cobertura é calculada a partir da morada completa e do raio configurado pela loja. O checkout confirma a disponibilidade antes de permitir continuar.</p>
            </LegalSection>
            <LegalSection title="Preparação e disponibilidade">
                <p>Trabalhamos com flores frescas e disponibilidade variável. As imagens são ilustrativas e podem existir substituições sazonais por elementos de valor e estilo equivalentes.</p>
                <p>Em caso de impossibilidade operacional excecional após o pagamento, entraremos em contacto e efetuaremos o reembolso integral sem demora injustificada.</p>
            </LegalSection>
            <LegalSection title="Receção da encomenda">
                <p>O cliente deve fornecer uma morada completa, um contacto válido e garantir que alguém pode receber a encomenda no período escolhido. Instruções especiais serão consideradas, mas não podem garantir acesso a locais fechados ou entrega a terceiros não identificados.</p>
            </LegalSection>
            <LegalSection title="Atrasos e incidentes">
                <p>Trânsito, meteorologia e outras circunstâncias fora do controlo razoável podem afetar o horário. Se receber um produto danificado ou incorreto, contacte o apoio com o número da encomenda e fotografias logo que possível.</p>
            </LegalSection>
        </LegalPage>
    );
}
