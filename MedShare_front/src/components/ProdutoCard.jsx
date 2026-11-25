function ProdutoCard({lote}){
    const {medicamento,precoOriginal,percentualDesconto,dataValidade} = lote;

    const precoFinal = (precoOriginal * (100 - percentualDesconto)) / 100;
    const dias = Math.ceil((new Date(dataValidade) - new Date()) / (1000 * 60 * 60 * 24));

    const moeda = (valor) =>
        valor.toLocaleString("pt-BR",{style : "currency",currency: "BRL"})

    return (
        <div className= "card">
            <div className ="card-images">
                <span className= "selo-desconto">-{percentualDesconto}%</span>
                <span className="selo-validade">Vence em {dias}</span>
            </div>
            <div className="card-corpo">
                <h3>{medicamento.nome}</h3>
                <p className="card-desc">
                    {medicamento.categoria}  •  {medicamento.principioAtivo}
                </p>
                <div className="card-rodape">
                    <div>
                        <span className="preco-original">{moeda(precoOriginal)}</span>
                        <strong className="preco-final">{moeda(precoFinal)}</strong>
                    </div>
                    <button>Comprar</button>
                </div>
            </div>
        </div>
    );
}
