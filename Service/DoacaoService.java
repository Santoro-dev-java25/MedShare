package com.medshare.medshare.Service;

import com.medshare.medshare.Enums.StatusLote;
import com.medshare.medshare.Model.Doacao;
import com.medshare.medshare.Model.Lote;
import com.medshare.medshare.Model.Ong;
import com.medshare.medshare.Repository.DoacaoRepository;
import com.medshare.medshare.Repository.FarmaciaRepository;
import com.medshare.medshare.Repository.LoteRepository;
import com.medshare.medshare.Repository.OngRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class DoacaoService {

    private final DoacaoRepository doacaoRepository;
    private final OngRepository ongRepository;
    private final LoteRepository loteRepository;

    public DoacaoService(DoacaoRepository doacaoRepository,OngRepository ongRepository,LoteRepository loteRepository){
        this.doacaoRepository = doacaoRepository;
        this.ongRepository = ongRepository;
        this.loteRepository = loteRepository;
    }

    public Doacao reivindicar(Long idlote,Long idOng,int quantidade){
        Lote lote = loteRepository.findById(idlote).orElseThrow(() -> new IllegalArgumentException("Lote nao encontrado"));

        Ong ong = ongRepository.findById(idOng).orElseThrow(() -> new IllegalArgumentException("Ong nao encontrada"));

        if(!ong.isAprovado()){
            throw new IllegalStateException("A ong ainda nao foi aprovada pelo Administrador");
        }

        if(quantidade <=0){
            throw new IllegalArgumentException("Quantidade deve ser maior que zero");
        }

        if(lote.getStatus() != StatusLote.DISPONIVEL_DOACAO){
            throw new IllegalStateException("Esse lote nao esta disponivel para doacao");
        }

        if(lote.getQuantidade() < quantidade){
            throw new IllegalArgumentException("Quantidade maior que o estoque do lote");
        }

        lote.setQuantidade(lote.getQuantidade() - quantidade);

        Doacao doacao = new Doacao();
        doacao.setLote(lote);
        doacao.setOng(ong);
        doacao.setQuantidadeDoada(quantidade);


        loteRepository.save(lote);
        return doacaoRepository.save(doacao);


    }
}
