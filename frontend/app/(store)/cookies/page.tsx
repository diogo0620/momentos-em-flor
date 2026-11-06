import { LegalPage, LegalSection } from "@/components/legal/LegalPage";
import { legalLastUpdated } from "@/lib/legal/business";

export const metadata = { title: "Política de Cookies | Momentos em Flor" };

export default function CookiesPage() {
    return (
        <LegalPage eyebrow={`Atualizada em ${legalLastUpdated}`} title="Política de Cookies" intro="Informação sobre cookies e armazenamento local utilizados pela loja.">
            <LegalSection title="1. O que são">
                <p>Cookies são pequenos ficheiros guardados pelo navegador. A loja também usa armazenamento local para manter determinadas preferências e funcionalidades no dispositivo.</p>
            </LegalSection>
            <LegalSection title="2. Tecnologias estritamente necessárias">
                <p>Utilizamos tecnologias essenciais para autenticação segura, manutenção da sessão, carrinho, favoritos, segurança e processamento do pagamento. Sem estas funcionalidades, a loja e o checkout não funcionam corretamente.</p>
                <p>O carrinho e os favoritos podem ser mantidos no armazenamento local do navegador. A autenticação usa um cookie de sessão protegido. O Stripe pode definir os elementos técnicos necessários à prevenção de fraude e ao pagamento seguro.</p>
            </LegalSection>
            <LegalSection title="3. Analítica e publicidade">
                <p>Nesta versão não utilizamos cookies de publicidade nem de análise não essencial. Se forem adicionados no futuro, esta política e o mecanismo de consentimento serão atualizados antes da sua ativação.</p>
            </LegalSection>
            <LegalSection title="4. Gestão no navegador">
                <p>Pode apagar ou bloquear cookies nas definições do navegador. O bloqueio das tecnologias essenciais pode impedir o início de sessão, a preservação do carrinho ou a conclusão do pagamento.</p>
            </LegalSection>
        </LegalPage>
    );
}
