import { arrayOf, normalizeUser } from "./domain.js";
const env = import.meta.env || {};
export const API_URL = (env.VITE_API_URL || "http://localhost:8080").replace(
  /\/$/,
  "",
);
let accessToken = null;
export function setAccessToken(token) {
  accessToken = token || null;
}
export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}
export function listarOngsPendentes() {
  return request("/usuarios/ongs/pendentes");
}

export function aprovarOng(id) {
  return request(
    `/usuarios/ongs/${encodeURIComponent(id)}/aprovar`,
    { method: "PATCH" }
  );
}
export function listarFarmaciasPendentes() {
  return request("/usuarios/farmacias/pendentes");
}

export function aprovarFarmacia(id) {
  return request(
    `/usuarios/farmacias/${encodeURIComponent(id)}/aprovar`,
    { method: "PATCH" }
  );
}
export async function request(path, { method = "GET", body, signal } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  const abort = () => controller.abort();
  if (signal?.aborted) controller.abort();
  signal?.addEventListener("abort", abort, { once: true });
  try {
    const response = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        Accept: "application/json",
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      credentials: env.VITE_API_CREDENTIALS || "same-origin",
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      signal: controller.signal,
    });
    const text = await response.text();
    let data;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }
    if (!response.ok)
      throw new ApiError(
        data?.message ||
          data?.detail ||
          data?.mensagem ||
          `A API respondeu com erro ${response.status}.`,
        response.status,
        data,
      );
    return data;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error.name === "AbortError")
      throw new Error(
        "Requisição cancelada ou tempo limite de 15 segundos atingido.",
      );
    throw new Error(
      "Não foi possível acessar a API. Confira se o Spring Boot está rodando em localhost:8080 e se o CORS permite o frontend.",
    );
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", abort);
  }
}
function resource(path) {
  return {
    list: async (options) => {
      const first = await request(path, options);
      const items = arrayOf(first);
      // Suporta Page do Spring Data. Não apresenta métricas de apenas uma página.
      if (Number.isInteger(first?.totalPages) && first.totalPages > 1) {
        for (let page = 1; page < first.totalPages; page++) {
          const size = Number.isInteger(first.size)
            ? `&size=${first.size}`
            : "";
          items.push(
            ...arrayOf(await request(`${path}?page=${page}${size}`, options)),
          );
        }
      }
      return items;
    },
    get: (id, options) => request(`${path}/${encodeURIComponent(id)}`, options),
    create: (body) => request(path, { method: "POST", body }),
    update: (id, body) =>
      request(`${path}/${encodeURIComponent(id)}`, { method: "PUT", body }),
    remove: (id) =>
      request(`${path}/${encodeURIComponent(id)}`, { method: "DELETE" }),
  };
}
export const api = {
  usuarios: resource("/usuarios"),
  medicamentos: resource("/medicamentos"),
  lotes: resource("/lotes"),
  vendas: resource("/vendas"),
  doacoes: resource("/doacoes"),
};
// Centralize aqui as diferenças entre seus DTOs Java e os objetos da interface.
// IDs são strings para preservar valores BIGINT maiores que Number.MAX_SAFE_INTEGER.
export const payloads = {
  lote: (f) => ({
    idMedicamento: f.idMedicamento,
    idFarmacia: f.idFarmacia,
    quantidade: Number(f.quantidade),
    dataValidade: f.dataValidade,
    precoOriginal: Number(f.precoOriginal),
    status: "NORMAL",
    percentualDesconto: 0,
  }),
  venda: (lot, user, quantity) => ({
    idLote: lot.id,
    idCliente: user.id,
    quantidadeComprada: quantity,
  }),
  doacao: (lot, user, quantity) => ({
    idLote: lot.id,
    idOng: user.id,
    quantidadeDoada: quantity,
  }),
  usuario: (f) => ({
    nome: f.nome,
    email: f.email,
    senha: f.senha,
    tipo: f.tipo,
    ...(f.tipo === "CLIENTE"
      ? { cpf: f.documento, endereco: f.endereco }
      : {
          cnpj: f.documento,
          ...(f.tipo === "ONG"
            ? { areaAtuacao: f.areaAtuacao }
            : { endereco: f.endereco }),
        }),
  }),
};
export async function login(email, senha) {
  const path = env.VITE_AUTH_PATH;
  if (!path)
    throw new Error(
      "A rota de login não foi informada. Configure VITE_AUTH_PATH no .env e adapte login() ao seu controller. Use a demonstração para explorar as telas.",
    );
  if (!path.startsWith("/") || path.startsWith("//"))
    throw new Error(
      "VITE_AUTH_PATH deve ser um caminho local como /auth/login.",
    );
  const data = await request(path, { method: "POST", body: { email, senha } });
  const usuario = data?.usuario ?? data?.user;
  if (
    !usuario?.id ||
    !["FARMACIA", "CLIENTE", "ONG", "ADMIN"].includes(usuario.tipo)
  )
    throw new Error(
      "O login deve retornar { usuario: { id, nome, tipo }, token? }. Ajuste login() para seu JSON.",
    );
  setAccessToken(data.token);
  return normalizeUser(usuario);
}
export async function cadastrarUsuario(dados) {
  const rotas = {
    CLIENTE: "/usuarios/clientes",
    FARMACIA: "/usuarios/farmacias",
    ONG: "/usuarios/ongs",
  };

  const rota = rotas[dados.tipo];

  if (!rota) {
    throw new Error("Tipo de usuário inválido.");
  }

  return request(rota, {
    method: "POST",
    body: dados,
  });
}
// Não há comparação de senhas no navegador, nem consulta GET de usuários para simular autenticação.
