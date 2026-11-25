import { hydrate, today } from "./domain.js";
const future = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
export function createDemo() {
  const usuarios = [
    {
      id: "1",
      nome: "Farmácia São Paulo",
      tipo: "FARMACIA",
      endereco: "Av. Paulista, 1200 • São Paulo, SP",
    },
    { id: "2", nome: "Enzo", tipo: "CLIENTE" },
    { id: "3", nome: "ONG Saúde Para Todos", tipo: "ONG" },
    { id: "4", nome: "Administrador Geral", tipo: "ADMIN" },
    {
      id: "5",
      nome: "Drogaria Verde Penha",
      tipo: "FARMACIA",
      endereco: "Rua Augusta, 450 • São Paulo, SP",
    },
  ];
  const medicamentos = [
    {
      id: "1",
      nome: "Vitamina C 500mg",
      principioAtivo: "Ácido ascórbico",
      categoria: "Vitaminas",
    },
    {
      id: "2",
      nome: "Dipirona Sódica 500mg/ml",
      principioAtivo: "Dipirona",
      categoria: "Analgésicos",
    },
    {
      id: "3",
      nome: "Paracetamol 500mg",
      principioAtivo: "Paracetamol",
      categoria: "Analgésicos",
    },
    {
      id: "4",
      nome: "Soro Fisiológico 0,9%",
      principioAtivo: "Cloreto de sódio",
      categoria: "Higiene e cuidados",
    },
    {
      id: "5",
      nome: "Simeticona Gotas 75mg/ml",
      principioAtivo: "Simeticona",
      categoria: "Digestivos",
    },
    {
      id: "6",
      nome: "Vitamina D 1000 UI",
      principioAtivo: "Colecalciferol",
      categoria: "Vitaminas",
    },
  ];
  const lotes = medicamentos.map((m, i) => ({
    id: String(101 + i),
    idMedicamento: m.id,
    idFarmacia: i === 4 ? "5" : "1",
    quantidade: [450, 200, 180, 90, 120, 80][i],
    dataValidade: future([45, 62, 35, 76, 51, 88][i]),
    precoOriginal: [28.9, 11.2, 18.9, 22, 13.9, 68.9][i],
    status: "DESCONTO",
    percentualDesconto: [40, 30, 50, 20, 40, 10][i],
  }));
  lotes.push(
    ...[0, 3, 4].map((medIndex, i) => ({
      id: String(201 + i),
      idMedicamento: String(medIndex + 1),
      idFarmacia: i === 1 ? "5" : "1",
      quantidade: [90, 150, 70][i],
      dataValidade: future([14, 20, 9][i]),
      precoOriginal: 25,
      status: "DISPONIVEL_DOACAO",
      percentualDesconto: 0,
    })),
  );
  lotes.push({
    id: "301",
    idMedicamento: "2",
    idFarmacia: "1",
    quantidade: 42,
    dataValidade: future(-2),
    precoOriginal: 8.9,
    status: "VENCIDO",
    percentualDesconto: 0,
  });
  return hydrate({ usuarios, medicamentos, lotes, vendas: [], doacoes: [] });
}
export function demoTransaction(data, kind, lot, user, quantity) {
  const current = data.lotes.find((l) => l.id === lot.id);
  if (
    !current ||
    quantity < 1 ||
    !Number.isInteger(quantity) ||
    quantity > current.quantidade
  )
    throw new Error("Quantidade indisponível.");
  const t = {
    id: String(Date.now()),
    idLote: lot.id,
    idCliente: user.id,
    idOng: user.id,
    quantidade: quantity,
    precoFinal:
      Math.round(
        lot.precoOriginal * (1 - lot.percentualDesconto / 100) * quantity * 100,
      ) / 100,
    data: today(),
    dataRetirada: null,
    kind,
  };
  const key = kind === "venda" ? "vendas" : "doacoes";
  return {
    ...data,
    lotes: data.lotes.map((l) =>
      l.id === lot.id ? { ...l, quantidade: l.quantidade - quantity } : l,
    ),
    [key]: [...data[key], t],
  };
}
