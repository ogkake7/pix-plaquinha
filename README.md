# Pix na Plaquinha

Transforme pagamentos no balcão! Clientes pagam via NFC em segundos (QR Code/Copia e Cola). Lojistas atualizam a chave Pix num painel dinâmico, sem regravar a tag. Arquitetura serverless usando Vanilla JS, Vercel Functions e Upstash Redis.

Página de pagamento Pix para plaquinhas NFC. O link gravado na plaquinha é fixo
(`https://SEU-SITE.vercel.app/?l=nome-do-lojista`) e nunca muda. Chave, recebedor,
valor e formato ficam salvos no banco e o lojista altera pelo painel quando quiser.

## Arquivos

- `index.html`: painel do lojista (abrindo o site sem `?l=`) e página do cliente (com `?l=nome`).
- `api/lojista.js`: função da Vercel que salva e lê a configuração de cada lojista.
- `package.json`: só marca o projeto como Node 18 ou mais novo.

## Publicar na Vercel

1. Suba estes arquivos em um repositório do GitHub (mantenha a pasta `api/`).
2. Na Vercel: **Add New → Project**, escolha o repositório e clique em **Deploy**.
3. Conecte o banco: no projeto, aba **Storage → Create Database → Upstash (Redis)**
   e conecte ao projeto. A Vercel cria sozinha as variáveis
   `KV_REST_API_URL` e `KV_REST_API_TOKEN` (também funciona com
   `UPSTASH_REDIS_REST_URL` e `UPSTASH_REDIS_REST_TOKEN`).
4. Faça um novo deploy (**Deployments → Redeploy**) para as variáveis valerem.

## Usar

1. Abra `https://SEU-SITE.vercel.app/` (use o domínio de produção, em Settings → Domains na Vercel, e não os endereços `...-projects.vercel.app`).
2. Preencha chave, recebedor, valor e formato.
3. No passo 4 escolha o nome do link e uma senha (mínimo 6 caracteres) e clique em **Salvar configurações**.
4. O painel passa a mostrar um resumo da sua plaquinha, com o link pronto. Copie e grave na plaquinha como **URL / Link** (NFC Tools ou NFC TagWriter, etiqueta NTAG213 ou NTAG215).
5. O aparelho lembra a loja: ao abrir o painel de novo, o resumo aparece direto, sem refazer nada. Os dados ficam travados.
6. Para mudar algo, toque em **Alterar configurações**, edite, digite a senha do painel e salve. A plaquinha não precisa ser regravada.
7. Em outro aparelho, use **Já configurou uma plaquinha?** no topo, digite o nome do link e toque em **Abrir**. Para trocar de loja num aparelho, use **Sair deste aparelho**.

## Segurança

- A configuração (chave Pix, nome, cidade) é pública para quem abrir o link, é o que o cliente vê.
- A senha é guardada só como hash (scrypt). Depois de 8 senhas erradas, o nome fica bloqueado por 15 minutos.
- Quem cria um nome primeiro fica com ele. Anote o nome e a senha.
