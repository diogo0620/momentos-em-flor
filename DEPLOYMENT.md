# Publicação da primeira versão

O projeto está preparado para correr com Docker Compose num servidor Linux. O Caddy incluído trata automaticamente do HTTPS e encaminha o frontend e a API.

## 1. Configurar o ambiente

Copiar `.env.production.example` para `.env.production` e substituir todos os valores `replace`. Para instalações separadas, usar também `backend/.env.production.example` e `frontend/.env.production.example` como listas de referência. Os endereços públicos devem ser HTTPS:

- `PUBLIC_WEB_URL`: endereço do frontend, sem barra final;
- `PUBLIC_API_URL`: endereço público do backend, incluindo `/api`;
- `COOKIE_DOMAIN`: pode ficar vazio quando frontend e API usam domínios diferentes; para subdomínios do mesmo domínio pode usar `.example.com`;
- `COOKIE_SAME_SITE`: usar `none` quando frontend e API estão em sites diferentes e `lax` quando partilham o mesmo domínio base.

As variáveis `NEXT_PUBLIC_*` são incorporadas no frontend durante o build. Sempre que forem alteradas é necessário reconstruir o serviço `web`.

No primeiro arranque, `BOOTSTRAP_ADMIN_*` cria o administrador inicial. Nos arranques seguintes a password não é alterada. O processo também garante a existência do IVA normal e da configuração base da taxa de entrega, sem carregar dados de demonstração.

## 2. DNS e HTTPS

Apontar os domínios indicados por `WEB_DOMAIN` e `API_DOMAIN` para o servidor e abrir apenas as portas 22, 80 e 443 na firewall. O PostgreSQL, o frontend e o backend não publicam portas diretamente; comunicam apenas na rede interna do Compose.

### Endereço temporário sem domínio próprio

Para uma versão de testes pode usar o DNS público `sslip.io`, que transforma um nome contendo o IPv4 do servidor num endereço válido. Para um servidor com IP `203.0.113.10`, por exemplo:

```env
WEB_DOMAIN=flores.203-0-113-10.sslip.io
API_DOMAIN=api-flores.203-0-113-10.sslip.io
PUBLIC_WEB_URL=https://flores.203-0-113-10.sslip.io
PUBLIC_API_URL=https://api-flores.203-0-113-10.sslip.io/api
```

Não é necessário criar registos DNS. O Caddy tentará emitir certificados HTTPS para estes dois nomes. Como `sslip.io` é um serviço público partilhado e pode estar sujeito a limites de emissão, este endereço deve ser usado apenas para staging; quando existir um domínio próprio basta substituir os quatro valores e reconstruir os serviços.

## 3. Arrancar

```sh
docker compose --env-file .env.production -f compose.production.yml up -d --build
```

O backend aplica automaticamente as migrations pendentes antes de arrancar. O estado pode ser verificado em `https://api.example.com/api/health`.

## 4. Integrações externas

- configurar o webhook Stripe para `https://api.example.com/api/payments/webhook`;
- autorizar os domínios públicos nas configurações da Stripe, Supabase e Google Maps;
- confirmar o domínio de envio no Resend;
- enquanto o domínio não estiver confirmado, definir `RESEND_RECIPIENT_OVERRIDE` com o único destinatário autorizado; remover o valor depois da confirmação;
- definir `RESEND_BRAND_LOGO_URL` com um URL HTTPS público e os seis `RESEND_TEMPLATE_*` com os aliases publicados no Resend;
- definir `SUPABASE_BUCKET` explicitamente como `dev`, `test` ou `prod`, conforme o ambiente;
- configurar `FRONTEND_URL`/`PUBLIC_WEB_URL` corretamente para as ligações de recuperação de password.

## 5. Primeira publicação

Começar com chaves de teste da Stripe. Depois de validar criação, pagamento, email, atribuição à florista e entrega, substituir pelas chaves live e reconstruir o frontend com a publishable key live.

Antes de partilhar o endereço, preencher `NEXT_PUBLIC_LEGAL_ENTITY`, `NEXT_PUBLIC_LEGAL_NIF`, `NEXT_PUBLIC_LEGAL_ADDRESS`, `NEXT_PUBLIC_PRIVACY_EMAIL` e os dados do centro de resolução alternativa de litígios competente. Estes valores aparecem nos Termos e na Política de Privacidade e são incorporados durante o build do frontend.

## 6. Vercel + Railway + Supabase

No Railway, criar um serviço a partir do repositório com `backend` como Root Directory. O ficheiro `railway.toml` usa o Dockerfile, verifica `/api/health` e reinicia o serviço em caso de falha. Definir `PORT=3001`, gerar um domínio público e usar o pooler Supabase em modo session (porta 5432) em `DATABASE_URL`.

Na Vercel, importar o mesmo repositório com `frontend` como Root Directory. Definir:

```env
NEXT_PUBLIC_API_URL=/api
BACKEND_ORIGIN=https://nome-do-backend.up.railway.app
```

O rewrite mantém os pedidos do browser no domínio da Vercel, incluindo o cookie de refresh. No Railway, `FRONTEND_URL` e `CORS_ORIGINS` devem conter o endereço final `https://...vercel.app`, `COOKIE_SAME_SITE=lax` e `COOKIE_DOMAIN` deve ficar vazio. O webhook Stripe continua a apontar diretamente para `https://nome-do-backend.up.railway.app/api/payments/webhook`.
