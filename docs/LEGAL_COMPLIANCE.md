# Controlo jurídico e de conformidade

Última revisão técnica: 18 de novembro de 2026.

Este documento é um registo operacional. Não substitui uma revisão por advogado português nem, quando aplicável, por um encarregado de proteção de dados.

## Dados que têm de ser preenchidos antes da produção

- `NEXT_PUBLIC_LEGAL_ENTITY`: denominação legal completa.
- `NEXT_PUBLIC_LEGAL_NIF`: NIF/NIPC da entidade.
- `NEXT_PUBLIC_LEGAL_ADDRESS`: sede ou estabelecimento relevante.
- `NEXT_PUBLIC_CONTACT_EMAIL`, `NEXT_PUBLIC_CONTACT_PHONE` e `NEXT_PUBLIC_PRIVACY_EMAIL`.
- `NEXT_PUBLIC_RAL_NAME` e `NEXT_PUBLIC_RAL_URL`, confirmados segundo a sede, atividade e competência territorial.
- `NEXT_PUBLIC_BOOK_OF_COMPLAINTS_URL`, depois de registar/vincular o operador no Livro de Reclamações Eletrónico.

O lançamento público deve ficar bloqueado operacionalmente enquanto estes dados obrigatórios estiverem vazios.

## Matriz de controlo

| Área | Evidência esperada | Responsável | Frequência |
|---|---|---|---|
| Informação pré-contratual | Termos, preço total, entrega, pagamento e botão com obrigação de pagar | Operações + jurídico | A cada alteração do checkout |
| Versão legal aceite | Versão e data de aceitação guardadas na encomenda | Engenharia | Em cada encomenda |
| Reclamações | Registo, resposta, anexos e desfecho | Apoio | Em cada caso |
| RAL | Entidade competente publicada e atual | Jurídico | Semestral |
| Privacidade | Registo de atividades de tratamento e subcontratantes | Responsável de privacidade | Trimestral |
| Direitos RGPD | Identidade, pedido, decisões e prazo de resposta | Responsável de privacidade | Em cada pedido |
| Incidentes | Cronologia, impacto, contenção e decisão de notificação | Segurança + direção | Em cada incidente |
| Retenção | Política por categoria e eliminação comprovável | Jurídico + engenharia | Anual |
| Cookies | Inventário técnico e consentimento antes de qualquer cookie não essencial | Marketing + engenharia | A cada nova ferramenta |
| Faturação | Documento, estado Moloni, PDF e envio ao cliente | Financeiro | Em cada encomenda |
| Reembolsos | Motivo, autorização, referência Stripe e comunicação | Financeiro + apoio | Em cada reembolso |

## Processo de litígio

1. Associar a comunicação à conta, encomenda e pedido de suporte.
2. Preservar cronologia, mensagens, consentimentos, comprovativos, estado de entrega e documentos fiscais.
3. Limitar o acesso a quem trata o caso; nunca alterar a evidência original.
4. Responder factualmente, indicar a solução proposta e registar aceitação ou recusa.
5. Encaminhar ameaças formais, notificações de RAL, Livro de Reclamações ou tribunal para apoio jurídico.
6. Aplicar retenção legal específica e suspender eliminações automáticas enquanto o litígio estiver ativo.

## Proteção de dados

- Manter um registo das atividades de tratamento, finalidades, fundamento, categorias, destinatários, transferências, prazos e medidas de segurança.
- Documentar Stripe, Moloni, Resend, Supabase, Google Maps e fornecedores de alojamento como destinatários/subcontratantes conforme o contrato aplicável.
- Responder a pedidos de direitos, em regra, no prazo de um mês; documentar qualquer prorrogação legal e respetivo motivo.
- Definir prazos concretos para contas, suporte, logs, geocodificação, avaliações, marketing e documentos contabilísticos.
- Manter procedimento de violação de dados com avaliação das obrigações de notificação à CNPD e aos titulares.
- Confirmar por análise documentada se é obrigatório designar encarregado de proteção de dados; não assumir que o é em todos os casos.

## Revisão antes de cada publicação

- Executar checklist funcional do checkout, acessibilidade e informação pré-contratual.
- Confirmar que não existem alegações, avaliações, horários ou condições comerciais não verificadas.
- Rever alterações a integrações e fornecedores contra privacidade, cookies e contratos.
- Arquivar cópia das políticas publicadas e respetiva data de vigência.
- Obter validação jurídica para alterações materiais às políticas ou ao modelo de negócio.

## Referências oficiais de trabalho

- Decreto-Lei n.º 24/2014, contratos celebrados à distância, na redação em vigor: https://files.dre.pt/1s/2023/03/04500/0001100039.pdf
- Decreto-Lei n.º 84/2021, direitos do consumidor na compra de bens: https://files.dre.pt/1s/2021/10/20200/0000400029.pdf
- Decreto-Lei n.º 7/2004, comércio eletrónico: https://files.dre.pt/1s/2004/01/005a00/00700070.pdf
- Livro de Reclamações — perguntas frequentes: https://www.livroreclamacoes.pt/Inicio/PerguntasFrequentes
- Direção-Geral do Consumidor — resolução alternativa de litígios: https://www.consumidor.gov.pt/centro-europeu-consumidor-portugal3/consumidor/resolucao-de-conflitos/meios-de-resolucao-alternativa-de-litigios
- CNPD — direitos dos titulares: https://www.cnpd.pt/cidadaos/direitos/
- CNPD — registo de atividades de tratamento: https://www.cnpd.pt/organizacoes/outras-obrigacoes/registo-de-atividades-de-tratamento/
- Encerramento da antiga plataforma europeia ODR: https://consumer-redress.ec.europa.eu/site-relocation_en
