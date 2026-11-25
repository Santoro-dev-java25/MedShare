export const roles = {
  FARMACIA: "Farmácia",
  CLIENTE: "Cliente",
  ONG: "ONG",
  ADMIN: "Administrador",
};
export const statusLabels = {
  NORMAL: "Normal",
  DESCONTO: "Desconto",
  DISPONIVEL_DOACAO: "Doação",
  DESCARTE: "Descarte",
  VENCIDO: "Vencido",
};
export const money = (value) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    Number(value) || 0,
  );
export const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
// Datas de validade são datas civis: evita deslocamento de dia pelo fuso horário.
export function daysLeft(date, reference = today()) {
  if (!date) return null;
  const a = Date.parse(`${String(date).slice(0, 10)}T00:00:00Z`);
  const b = Date.parse(`${reference}T00:00:00Z`);
  return Number.isFinite(a) && Number.isFinite(b)
    ? Math.round((a - b) / 86400000)
    : null;
}
export const dateLabel = (date) =>
  date ? String(date).slice(0, 10).split("-").reverse().join("/") : "—";
export const finalUnitPrice = (lot) =>
  Number(lot.precoOriginal) * (1 - Number(lot.percentualDesconto || 0) / 100);
export const canBuy = (lot) =>
  lot.status === "DESCONTO" &&
  lot.quantidade > 0 &&
  daysLeft(lot.dataValidade) > 0;
export const canDonate = (lot) =>
  lot.status === "DISPONIVEL_DOACAO" &&
  lot.quantidade > 0 &&
  daysLeft(lot.dataValidade) > 0;
export function arrayOf(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.data)) return data.data;
  throw new Error(
    "Resposta de listagem inesperada. Ajuste arrayOf em services/domain.js ao JSON do controller.",
  );
}
export const relationId = (value) =>
  value && typeof value === "object"
    ? (value.id ?? value.usuarioId ?? value.usuario_id ?? value.usuario?.id)
    : value;
export function normalizeUser(u) {
  return {
    ...u,
    id: String(u.id ?? u.usuarioId ?? u.usuario_id),
    tipo: u.tipo,
    nome: u.nome || u.usuario?.nome || "Usuário",
  };
}
export function normalizeLot(l, medications = [], users = []) {
  const medId =
    relationId(l.medicamento) ?? l.idMedicamento ?? l.id_medicamento;
  const pharmacyId = relationId(l.farmacia) ?? l.idFarmacia ?? l.id_farmacia;
  const med =
    typeof l.medicamento === "object"
      ? l.medicamento
      : medications.find((m) => String(m.id) === String(medId));
  const pharmacy =
    typeof l.farmacia === "object"
      ? l.farmacia
      : users.find((u) => String(u.id) === String(pharmacyId));
  return {
    ...l,
    id: String(l.id),
    idMedicamento: String(medId ?? ""),
    idFarmacia: String(pharmacyId ?? ""),
    medicamento: med || {},
    farmacia: pharmacy || {},
    quantidade: Number(l.quantidade),
    dataValidade: l.dataValidade ?? l.data_validade,
    precoOriginal: Number(l.precoOriginal ?? l.preco_original),
    percentualDesconto: Number(
      l.percentualDesconto ?? l.percentual_desconto ?? 0,
    ),
  };
}
export function normalizeTransaction(t, kind) {
  return {
    ...t,
    id: String(t.id),
    idLote: String(relationId(t.lote) ?? t.idLote ?? t.id_lote ?? ""),
    idCliente: String(
      relationId(t.cliente) ?? t.idCliente ?? t.id_cliente ?? "",
    ),
    idOng: String(relationId(t.ong) ?? t.idOng ?? t.id_ong ?? ""),
    quantidade: Number(
      t.quantidade ??
        t.quantidadeComprada ??
        t.quantidade_comprada ??
        t.quantidadeDoada ??
        t.quantidade_doada ??
        0,
    ),
    precoFinal: Number(t.precoFinal ?? t.preco_final ?? 0),
    data:
      t.data ??
      t.dataVenda ??
      t.data_venda ??
      t.dataReivindicacao ??
      t.data_reivindicacao,
    dataRetirada: t.dataRetirada ?? t.data_retirada,
    kind,
  };
}
export const emptyData = () => ({
  usuarios: [],
  medicamentos: [],
  lotes: [],
  vendas: [],
  doacoes: [],
});
export function hydrate(raw) {
  const usuarios = raw.usuarios.map(normalizeUser);
  return {
    ...raw,
    usuarios,
    lotes: raw.lotes.map((l) => normalizeLot(l, raw.medicamentos, usuarios)),
    vendas: raw.vendas.map((t) => normalizeTransaction(t, "venda")),
    doacoes: raw.doacoes.map((t) => normalizeTransaction(t, "doacao")),
  };
}
