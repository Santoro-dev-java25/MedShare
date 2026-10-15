package com.medshare.medshare.Service;


import com.medshare.medshare.Enums.StatusLote;
import com.medshare.medshare.Model.Cliente;
import com.medshare.medshare.Model.Lote;
import com.medshare.medshare.Model.Venda;
import com.medshare.medshare.Repository.ClienteRepository;
import com.medshare.medshare.Repository.LoteRepository;
import com.medshare.medshare.Repository.VendaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
@Transactional
public class VendaService {

    private final VendaRepository vendaRepository;
    private final ClienteRepository clienteRepository;
    private final LoteRepository loteRepository;

    public VendaService(VendaRepository vendaRepository,ClienteRepository clienteRepository,LoteRepository loteRepository){
        this.vendaRepository = vendaRepository;
        this.clienteRepository = clienteRepository;
        this.loteRepository = loteRepository;
    }

    public Venda realizarVenda(Long idLote,Long idCliente,int quantidade){

        Lote lote = loteRepository.findById(idLote).orElseThrow(() -> new IllegalArgumentException("Lote nao encontrado"));

        Cliente cliente = clienteRepository.findById(idCliente).orElseThrow(() -> new IllegalArgumentException("Cliente nao encontrado"));

        if(quantidade <= 0){
            throw new IllegalArgumentException("Quantidade deve ser maior que zero");
        }

        if(lote.getStatus() != StatusLote.DESCONTO){
            throw new IllegalStateException("Este lote nao esta disponivel para venda");
        }

        if(lote.getQuantidade() < quantidade){
            throw new IllegalArgumentException("Quantidade maior que estoque do lote");
        }

        BigDecimal percentualRestante = BigDecimal.valueOf(100)
                .subtract(lote.getPercentualDesconto());

        BigDecimal precoFinal = lote.getPrecoOriginal()
                .multiply(percentualRestante)
                .multiply(BigDecimal.valueOf(quantidade))
                .divide(BigDecimal.valueOf(100),2, RoundingMode.HALF_UP);

        lote.setQuantidade(lote.getQuantidade() - quantidade);

        Venda venda = new Venda();
        venda.setCliente(cliente);
        venda.setLote(lote);
        venda.setPrecoFinal(precoFinal);
        venda.setQuantidadeComprada(quantidade);

        loteRepository.save(lote);
        return vendaRepository.save(venda);


    }
}
