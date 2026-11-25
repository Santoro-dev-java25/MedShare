# MedShare — React + Vite

Frontend do MedShare com identidade em branco, azul e vermelho, tipografia Inter, logotipo próprio, cartões, tabelas, gráficos e modais. A marca completa para reutilização está em `public/medshare-logo.svg` e o símbolo para ícones está em `public/medshare-mark.svg`.

## Atualizar um frontend MedShare que você já configurou

Extraia o ZIP em uma pasta separada. Copie apenas os arquivos abaixo para os mesmos caminhos no seu frontend atual:

- `src/App.jsx`
- `src/App.css`
- `src/components/UI.jsx`
- `public/` (mescle os arquivos desta pasta com os seus)
- `index.html` (para atualizar o ícone da aba)

Mantenha o seu `.env` e `src/services/api.js` atuais, incluindo o ajuste para o login simples do seu `AuthController`. Depois execute `npm run dev`. A fonte e as imagens já acompanham o pacote.

## Rodar no seu computador

Use Node.js 22.12+ (ou 24 LTS). Extraia esta pasta, abra no VS Code e execute no terminal dela:

```bash
npm install
npm run dev
```

Abra a URL exibida pelo Vite, normalmente `http://localhost:5173`. Se a porta estiver ocupada, o Vite poderá escolher outra; ajuste o CORS conforme necessário.

Na tela inicial, selecione um perfil e clique em **Abrir demonstração**. Você pode comprar, reservar doações, cadastrar lotes/medicamentos, consultar históricos e exportar o relatório CSV sem backend. O seletor no topo troca os perfis mantendo as operações da demonstração. Recarregar ou sair apaga esses dados. A demonstração nunca chama a API.

## Arquivos principais

| Arquivo                  | Responsabilidade                                                    |
| ------------------------ | ------------------------------------------------------------------- |
| `src/main.jsx`           | Monta o React na página                                             |
| `src/App.jsx`            | Login/cadastro, marketplace, detalhes, painéis, históricos e modais |
| `src/App.css`            | Layout e responsividade                                             |
| `src/components/UI.jsx`  | Cards, campos, tabelas auxiliares, ícones e ilustrações             |
| `src/services/api.js`    | Fetch, endpoints, autenticação e payloads dos DTOs                  |
| `src/services/domain.js` | Adaptação de JSON e cálculos da interface                           |
| `src/services/demo.js`   | Dados e operações apenas da demonstração                            |

## Conectar à API

A base já é `http://localhost:8080`. Copie `.env.example` para `.env` e ajuste se necessário:

```dotenv
VITE_API_URL=http://localhost:8080
VITE_AUTH_PATH=/auth/login
VITE_API_CREDENTIALS=same-origin
```

`/auth/login` corresponde ao `AuthController` discutido para o MedShare. Se seu controller usa outro caminho, ajuste `VITE_AUTH_PATH`. O SQL mostra as tabelas, mas não revela os DTOs, os métodos dos controllers ou o contrato de autenticação. A integração disponibiliza os fetches; é necessário conferir esse contrato antes de operar com dados reais.

O login envia `{ "email": "...", "senha": "..." }` e espera:

```json
{
  "token": "SEU_JWT",
  "usuario": { "id": "1", "nome": "Farmácia São Paulo", "tipo": "FARMACIA" }
}
```

Também aceita a propriedade `user` em lugar de `usuario`. Adapte `login()` em `api.js` se seu JSON for diferente. O token fica em memória e segue em `Authorization: Bearer ...`. Recarregar a página encerra a sessão local. Para cookie de sessão, use `VITE_API_CREDENTIALS=include` e configure CORS, cookie e CSRF no backend conforme sua autenticação.

Se você já possui autenticação no seu projeto, pode montar diretamente:

```jsx
<App usuarioInicial={usuarioLogado} tokenInicial={tokenJWT} />
```

`usuarioLogado` precisa conter `id`, `nome` e `tipo`. Passe esses dados da sua autenticação real. Essas propriedades inicializam a tela na montagem; para trocar a sessão, remonte o componente com uma `key` diferente. Não use um usuário fixo em produção para substituir autenticação.

Não foi implementado um falso login consultando senhas via `GET /usuarios`. O seletor de perfil da tela inicial serve à demonstração; o perfil real vem da resposta do servidor. O cadastro usa `POST /usuarios` e não permite selecionar ADMIN.

### Chamadas usadas pelas telas

| Operação                    | Método e rota        | Corpo assumido                                                                                                            |
| --------------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Cadastro de usuário         | `POST /usuarios`     | `nome`, `email`, `senha`, `tipo`, campos do perfil                                                                        |
| Lista de usuários (admin)   | `GET /usuarios`      | —                                                                                                                         |
| Medicamentos                | `GET /medicamentos`  | —                                                                                                                         |
| Novo medicamento (farmácia) | `POST /medicamentos` | `nome`, `principioAtivo`, `categoria`, `tipoTarja: "LIVRE"`                                                               |
| Lotes                       | `GET /lotes`         | —                                                                                                                         |
| Novo lote (farmácia)        | `POST /lotes`        | `idMedicamento`, `idFarmacia`, `quantidade`, `dataValidade`, `precoOriginal`, `status: "NORMAL"`, `percentualDesconto: 0` |
| Histórico de vendas         | `GET /vendas`        | —                                                                                                                         |
| Compra                      | `POST /vendas`       | `idLote`, `idCliente`, `quantidadeComprada`                                                                               |
| Histórico de doações        | `GET /doacoes`       | —                                                                                                                         |
| Reivindicação de doação     | `POST /doacoes`      | `idLote`, `idOng`, `quantidadeDoada`                                                                                      |

`api.js` também exporta `get(id)`, `update(id, body)` com PUT e `remove(id)` com DELETE para cada recurso. São funções disponíveis para expansão, não confirmação de que seus controllers implementam esses métodos. A interface não faz exclusões.

A área de farmácia consulta medicamentos e lotes; a de cliente consulta também vendas; a de ONG consulta também doações; o admin consulta os cinco recursos. O backend precisa permitir as consultas necessárias a cada perfil ou oferecer endpoints próprios que você mapeie no serviço. O frontend não substitui a autorização do servidor.

### Exemplo de JSON de lote

```json
{
  "id": "101",
  "idMedicamento": "1",
  "idFarmacia": "1",
  "quantidade": 90,
  "dataValidade": "2026-12-25",
  "precoOriginal": 28.9,
  "percentualDesconto": 40,
  "status": "DESCONTO"
}
```

A leitura aceita nomes equivalentes em snake_case (`id_medicamento`, `data_validade`, etc.) e relações aninhadas `medicamento` e `farmacia`. Os nomes são resolvidos pela lista de medicamentos e pelo usuário autenticado quando possível. Para clientes e ONGs verem o nome/endereço de outras farmácias, o ideal é incluir dados públicos de `farmacia` na resposta de lotes:

```json
{
  "id": "101",
  "medicamento": {
    "id": "1",
    "nome": "Vitamina C 500mg",
    "categoria": "Vitaminas"
  },
  "farmacia": {
    "usuarioId": "1",
    "nome": "Farmácia São Paulo",
    "endereco": "Rua das Flores, 100"
  },
  "quantidade": 90,
  "dataValidade": "2026-12-25",
  "precoOriginal": 28.9,
  "percentualDesconto": 40,
  "status": "DESCONTO"
}
```

Listagens podem retornar um array, `{ "data": [...] }` ou um `Page` Spring `{ "content": [...], "totalPages": 2, "size": 20 }`. Para Page, o serviço percorre as páginas usando `page` e `size`. Outros envelopes precisam de adaptação em `arrayOf()`.

IDs são enviados como strings; ajuste `payloads` se seu DTO exigir outro formato. Para BIGINT acima de `Number.MAX_SAFE_INTEGER`, o backend também precisa serializar o ID como string: converter depois de JSON.parse não recupera precisão já perdida.

### Onde ajustar seus DTOs

Todos os corpos de lote, usuário, venda e doação ficam no objeto `payloads`, em `api.js`. Exemplo: se seu controller espera relações no lugar de IDs:

```js
venda: (lot, user, quantity) => ({
  lote: { id: lot.id },
  cliente: { usuarioId: user.id },
  quantidadeComprada: quantity,
});
```

Esse exemplo precisa corresponder ao seu DTO Java real. Não altere apenas com base no nome das colunas SQL.

O cadastro de perfil usa um único POST `/usuarios`. Ele assume que seu backend cria também a linha relacionada em `farmacia`, `cliente` ou `ong`, dentro de uma transação. Se isso não ocorrer, ajuste o controller/DTO ou adapte o fluxo às rotas existentes. As rotas dessas três tabelas não foram informadas.

### Regras que precisam estar no backend

- O motor de decisão deve calcular/persistir status e percentual de desconto no cadastro e na atualização diária. A interface usa o status retornado pela API; não inventa regras de classificação para seus dados reais.
- O backend deve definir `dataVenda`, calcular `precoFinal` total e reduzir estoque na mesma transação ao criar a venda. O formulário envia apenas os IDs e quantidade. Se seu DTO atualmente exigir preço/data, adapte o contrato para não confiar no preço informado pelo cliente.
- Ao reivindicar uma doação, deve validar ONG aprovada, lote e quantidade, definir `dataReivindicacao` e reservar/reduzir o estoque de forma atômica. `dataRetirada` começa nula. A tela registra a reserva; não implementa um fluxo de confirmação de retirada porque essa rota não foi informada.
- Valide titularidade, permissões, aprovação, validade, estoque e concorrência no servidor. Receber `idCliente`/`idOng`/`idFarmacia` no JSON não deve permitir agir por outra pessoa; confira com a identidade autenticada.
- O marketplace mostra lotes DESCONTO com estoque e validade futura; a ONG vê DISPONIVEL_DOACAO com os mesmos critérios. Lotes NORMAL, DESCARTE e VENCIDO não têm ação de compra/resgate.

O SQL marca datas, preço final e percentual como NOT NULL; esses valores precisam ser preenchidos pelos services do backend. Os POSTs de venda e doação não gravam diretamente nas tabelas.

### CORS em desenvolvimento

Libere a origem exata `http://localhost:5173` para seus controllers, por exemplo com `@CrossOrigin(origins = "http://localhost:5173")`, ou na configuração CORS global. Se usar Spring Security, a configuração de segurança também precisa habilitar o processamento de CORS e o preflight OPTIONS. Para Bearer, permita o header Authorization e Content-Type. Para cookie, use allowCredentials e origem explícita.

O localhost do navegador é o seu próprio computador. Rode frontend e backend nele. Se abrir o frontend de outro aparelho ou hospedar o site, troque a base da API por um endereço alcançável e configure HTTPS/CORS adequadamente. Variáveis VITE são públicas: nunca coloque segredo nelas.

## Métricas e relatório

O painel calcula dados das respostas recebidas. Unidades redirecionadas somam compras e reservas de doação; reserva não significa retirada concluída. Valor de vendas soma `precoFinal`, assumido como total de cada venda. O histórico de doação usa `dataRetirada` para distinguir pendente/recebido. Não são exibidas porcentagens de economia ou impacto inventadas.

O gráfico circular conta lotes por status; as barras somam unidades por mês nos últimos cinco meses. Há tabela acessível com os valores das barras. O log mostra os 20 registros mais recentes; a exportação CSV inclui todos os registros carregados. Se uma consulta falhar, o aviso informa quais recursos faltam e que as métricas estão parciais.

## Conferência

```bash
npm test
npm run build
npm run preview
```

Os testes verificam datas, adaptação de campos, limites de estoque, transações da demonstração, payloads, respostas HTTP/204/409 e paginação. Os testes de interface usam DOM simulado, não substituem uma conferência visual no navegador.

## Ajustes no SQL enviado

Faltam `;` no final destas duas instruções:

```sql
alter table farmacia alter column cnpj set not null;
alter table ong alter column area_atuacao set not null;
```

Seu schema não possui campo de imagem de medicamento nem código comercial de lote. Por isso a interface usa ilustrações SVG e o próprio ID do lote. Descontos e exemplos visuais não são regras legais ou clínicas.
