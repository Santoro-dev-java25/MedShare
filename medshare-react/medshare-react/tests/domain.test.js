import test from "node:test";
import assert from "node:assert/strict";
import {
  daysLeft,
  hydrate,
  canBuy,
  canDonate,
  finalUnitPrice,
  arrayOf,
  today,
} from "../src/services/domain.js";
import { createDemo, demoTransaction } from "../src/services/demo.js";
import {
  api,
  request,
  setAccessToken,
  ApiError,
  payloads,
} from "../src/services/api.js";
test("datas civis sem deslocamento de fuso", () => {
  assert.equal(daysLeft("2026-11-11", "2026-11-10"), 1);
  assert.equal(daysLeft("2026-11-09", "2026-11-10"), -1);
  assert.equal(daysLeft(null), null);
  assert.equal(daysLeft("inválida"), null);
});
test("normalização aceita snake_case, camelCase, relações e IDs bigint em string", () => {
  const d = hydrate({
    usuarios: [{ id: "9007199254740993", nome: "Farmácia", tipo: "FARMACIA" }],
    medicamentos: [{ id: 2, nome: "Vitamina" }],
    lotes: [
      {
        id: 1,
        id_farmacia: "9007199254740993",
        id_medicamento: 2,
        preco_original: "20.00",
        percentual_desconto: "25.00",
        quantidade: 10,
        data_validade: "2027-01-01",
        status: "DESCONTO",
      },
    ],
    vendas: [],
    doacoes: [],
  });
  assert.equal(d.lotes[0].farmacia.nome, "Farmácia");
  assert.equal(d.lotes[0].medicamento.nome, "Vitamina");
  assert.equal(finalUnitPrice(d.lotes[0]), 15);
  assert.equal(d.lotes[0].idFarmacia, "9007199254740993");
});
test("bloqueia compra e doação sem estoque, vencidas ou com status incompatível", () => {
  const d = createDemo(),
    l = d.lotes.find(canBuy);
  assert.ok(l);
  assert.equal(canBuy({ ...l, quantidade: 0 }), false);
  assert.equal(canBuy({ ...l, dataValidade: "2020-01-01" }), false);
  assert.equal(canBuy({ ...l, status: "NORMAL" }), false);
  assert.equal(canDonate(l), false);
  assert.ok(d.lotes.some(canDonate));
});
test("compra/reserva demo reduz somente o lote correto e mantém histórico após cadastro", () => {
  const d = createDemo(),
    l = d.lotes.find(canBuy);
  const next = demoTransaction(d, "venda", l, d.usuarios[1], 2);
  assert.equal(
    next.lotes.find((x) => x.id === l.id).quantidade,
    l.quantidade - 2,
  );
  assert.equal(d.lotes.find((x) => x.id === l.id).quantidade, l.quantidade);
  assert.equal(next.vendas[0].quantidade, 2);
  assert.equal(next.vendas[0].data, today());
  assert.equal(hydrate(next).vendas[0].data, today());
  assert.throws(() =>
    demoTransaction(d, "venda", l, d.usuarios[1], l.quantidade + 1),
  );
  assert.throws(() => demoTransaction(d, "venda", l, d.usuarios[1], 1.5));
  const dl = d.lotes.find(canDonate),
    dn = demoTransaction(d, "doacao", dl, d.usuarios[2], 3);
  assert.equal(dn.doacoes.length, 1);
  assert.equal(dn.doacoes[0].idOng, "3");
});
test("formato inesperado de listagem gera erro explícito", () => {
  assert.throws(() => arrayOf({ erro: true }));
  assert.deepEqual(arrayOf({ content: [1] }), [1]);
});
test("payload de venda não permite que frontend determine preço final", () => {
  const p = payloads.venda({ id: "101" }, { id: "2" }, 2);
  assert.deepEqual(p, { idLote: "101", idCliente: "2", quantidadeComprada: 2 });
});
test("fetch envia JSON e Bearer, aceita 204 e preserva erro do backend", async () => {
  const original = globalThis.fetch;
  try {
    setAccessToken("test-token");
    globalThis.fetch = async (url, opts) => {
      assert.equal(url, "http://localhost:8080/vendas");
      assert.equal(opts.method, "POST");
      assert.equal(opts.headers.Authorization, "Bearer test-token");
      assert.equal(opts.body, '{"q":2}');
      return new Response(null, { status: 204 });
    };
    assert.equal(await api.vendas.create({ q: 2 }), null);
    globalThis.fetch = async () =>
      new Response(JSON.stringify({ message: "Estoque insuficiente" }), {
        status: 409,
      });
    await assert.rejects(
      request("/vendas"),
      (e) =>
        e instanceof ApiError &&
        e.status === 409 &&
        e.message === "Estoque insuficiente",
    );
    globalThis.fetch = async () => {
      throw new TypeError("Failed to fetch");
    };
    await assert.rejects(request("/lotes"), /CORS/);
  } finally {
    globalThis.fetch = original;
    setAccessToken(null);
  }
});
test("listagem de Page Spring carrega todas as páginas", async () => {
  const original = globalThis.fetch;
  const urls = [];
  try {
    globalThis.fetch = async (url) => {
      urls.push(url);
      return new Response(
        JSON.stringify(
          url.includes("page=1")
            ? { content: [{ id: 2 }], totalPages: 2, size: 1 }
            : { content: [{ id: 1 }], totalPages: 2, size: 1 },
        ),
      );
    };
    assert.deepEqual(await api.lotes.list(), [{ id: 1 }, { id: 2 }]);
    assert.match(urls[1], /page=1&size=1/);
  } finally {
    globalThis.fetch = original;
  }
});
