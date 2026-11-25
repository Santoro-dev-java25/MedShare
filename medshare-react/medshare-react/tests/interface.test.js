import test from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { build } from "esbuild";
import { mkdir, rm } from "node:fs/promises";
import React, { act } from "react";
import { createRoot } from "react-dom/client";

// DOM simulado para conferir fluxos de React mesmo em ambientes sem navegador.
test("fluxos completos: compra, reserva, cadastro, filtros e painéis", async () => {
  const dom = new JSDOM('<!doctype html><div id="root"></div>', {
    url: "http://localhost:5173",
  });
  for (const key of [
    "window",
    "document",
    "HTMLElement",
    "HTMLDialogElement",
    "Event",
    "MouseEvent",
    "FormData",
  ])
    globalThis[key] = dom.window[key];
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute("open");
  };
  await mkdir(".test-temp", { recursive: true });
  await build({
    entryPoints: ["src/App.jsx"],
    outfile: ".test-temp/app.mjs",
    bundle: true,
    format: "esm",
    platform: "node",
    external: ["react", "react-dom"],
    define: { "import.meta.env": "{}" },
  });
  const { default: App } = await import("../.test-temp/app.mjs");
  const root = createRoot(document.getElementById("root"));
  const text = () => document.body.textContent;
  const button = (name) =>
    [...document.querySelectorAll("button")].find(
      (b) => b.textContent.trim() === name,
    );
  const click = async (name) => {
    const el =
      name === "Comprar"
        ? document.querySelector(".product-card button")
        : button(name);
    assert.ok(el, `Botão ${name} existe`);
    await act(async () => el.click());
  };
  const fill = async (selector, value) => {
    const el = document.querySelector(selector);
    assert.ok(el, selector);
    await act(async () => {
      el.value = value;
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
    });
  };
  const submit = async () => {
    await act(async () =>
      document
        .querySelector("dialog form")
        .dispatchEvent(
          new Event("submit", { bubbles: true, cancelable: true }),
        ),
    );
  };
  const switchRole = async (value) =>
    fill('[aria-label="Perfil da demonstração"]', value);
  try {
    await act(async () => root.render(React.createElement(App)));
    assert.match(text(), /Seja bem-vindo/);
    await click("Cliente");
    await click("Abrir demonstração");
    assert.equal(document.querySelectorAll(".product-card").length, 6);
    await click("Comprar");
    await click("Comprar agora");
    assert.match(text(), /Confirmar Compra/);
    // O controle React da quantidade inicia com uma unidade.
    await submit();
    assert.equal(document.querySelector("dialog"), null);
    await click("Minhas compras");
    assert.match(text(), /1 un\./);
    await switchRole("ONG");
    assert.match(text(), /Olá, ONG Saúde Para Todos/);
    await click("Reivindicar Lote");
    await submit();
    await click("Meus resgates");
    assert.match(text(), /A combinar/);
    await switchRole("FARMACIA");
    await click("Cadastrar Novo Lote");
    await fill('[name="idMedicamento"]', "1");
    await fill('[name="quantidade"]', "12");
    await fill('[name="dataValidade"]', "2027-01-01");
    await fill('[name="precoOriginal"]', "18.50");
    await submit();
    assert.match(text(), /12 un\./);
    assert.equal(document.querySelector("dialog"), null);
    await switchRole("ADMIN");
    assert.match(text(), /Painel Administrativo Geral/);
    assert.equal(document.querySelectorAll(".bars .bar-column").length, 5);
    assert.match(text(), /Doação Social/);
    await switchRole("CLIENTE");
    const category = [...document.querySelectorAll(".filter-group label")]
      .find((el) => el.textContent === "Vitaminas")
      .querySelector("input");
    await act(async () => category.click());
    assert.equal(document.querySelectorAll(".product-card").length, 2);
    // Fecha um modal por Escape através do evento cancel nativo do dialog.
    await click("Comprar");
    await click("Comprar agora");
    await act(async () =>
      document
        .querySelector("dialog")
        .dispatchEvent(new Event("cancel", { cancelable: true })),
    );
    assert.equal(document.querySelector("dialog"), null);
  } finally {
    await act(async () => root.unmount());
    dom.window.close();
    await rm(".test-temp", { recursive: true, force: true });
    delete globalThis.IS_REACT_ACT_ENVIRONMENT;
  }
});
