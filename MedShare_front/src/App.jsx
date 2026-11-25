import ProdutoCard from "./components/ProdutoCard";
import "./App.css";

const lotes = [
  {
    id: 1,
    dataValidade:"2027-01-01",
    percentualDesconto: 30,
    precoOriginal: 20,
    medicamento: {nome:"Vitamina C 500mg",principioAtivo: "Ácido ascórbico",categoria:"Vitamina"},
  },
  {
    id: 2,
    dataValidade: "2026-12-20",
    percentualDesconto : 45,
    precoOriginal: 11.2,
    medicamento: {nome : "Dipirona 500mg",principioAtivo: "Dipirona sódica",categoria: "Ánalgestico"},
  },
];

function App(){
  return (
    <div className="grade">
      {lotes.map((lote) => (
        <ProdutoCard key = {lote.id} lote={lote} />))}
    </div>
  );
}

export default App;