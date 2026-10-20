# Pix na Plaquinha

Página de pagamento Pix para plaquinhas NFC. O cliente encosta o celular na plaquinha, abre a página do estabelecimento e paga com Pix copia e cola ou QR Code. O lojista configura tudo em um painel simples e o link gravado na plaquinha nunca muda.

## O problema que resolve

Estabelecimentos pequenos recebem Pix passando a chave por fala, papel ou foto. Isso gera erro de digitação, perda de tempo no balcão e dúvida sobre quem está recebendo. A plaquinha NFC entrega os dados corretos com um toque.

## Como funciona

1. O lojista abre o painel, informa a chave Pix, o nome de quem recebe, a cidade e escolhe o formato de pagamento.
2. Ele escolhe um nome de link e uma senha e salva. Os dados ficam guardados no servidor.
3. Ele grava na plaquinha NFC o link `https://seu-site.vercel.app/?l=nome-do-lojista`, uma única vez.
4. O cliente encosta o celular, a página abre com os dados do estabelecimento e ele paga pelo app do banco.
5. Se o lojista mudar qualquer configuração, basta salvar de novo no painel. A plaquinha continua funcionando sem regravar.

## Funcionalidades

**Painel do lojista**
- Chave Pix de qualquer tipo: CPF, CNPJ, celular, e-mail ou chave aleatória, com validação de cada tipo.
- Nome do estabelecimento, nome do recebedor e cidade.
- Valor digitado pelo cliente ou valor fixo.
- Formato exibido: copia e cola e QR Code, só copia e cola, ou só QR Code.
- Mensagem opcional enviada junto com o Pix (por exemplo, "Mesa 4").
- Prévia ao vivo da tela que o cliente vê.
- Link da plaquinha gerado automaticamente com o endereço do site.
- Edição protegida por senha.

**Página do cliente**
- Nome do estabelecimento, valor, nome do recebedor, chave Pix, cidade e horário.
- Pix copia e cola e QR Code no padrão oficial do Pix, lidos por qualquer app de banco.
- Botão para copiar a chave Pix, inclusive abaixo do QR Code, para o caso de a leitura falhar.
- Quando o valor não é fixo, o cliente digita e o código e o QR Code se atualizam na hora.
- Aviso para conferir o nome do recebedor no app do banco antes de confirmar.
- Layout pensado para celular, com tema claro e escuro.

## Tecnologia

- Front-end em um único `index.html`, sem etapa de build.
- Uma função serverless na Vercel (`api/lojista.js`) para salvar e ler as configurações.
- Banco Upstash Redis, conectado pela própria Vercel.
- Geração do Pix copia e cola (BR Code com CRC16) e do QR Code feita no navegador.
- Senhas guardadas apenas como hash (scrypt), com bloqueio temporário após 8 tentativas erradas.

## Limitações atuais

- O sistema não confirma se o pagamento foi feito. Isso exigiria Pix dinâmico com um provedor de pagamento.
- O nome do recebedor é digitado pelo lojista e não é validado contra o banco.
- A configuração (chave, nome, cidade) é pública para quem abrir o link, já que é o que o cliente vê.
- Quem cria um nome de link primeiro fica com ele.
- O deploy real na Vercel com o Upstash ainda não foi testado. Os testes foram feitos com um banco simulado.

## Texto curto para a descrição do repositório

> Página de pagamento Pix para plaquinhas NFC. O cliente encosta o celular e paga por Pix copia e cola ou QR Code. O lojista configura chave, recebedor, valor e formato em um painel, e o link da plaquinha nunca muda.
