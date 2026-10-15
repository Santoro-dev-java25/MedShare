package com.medshare.medshare.Service;

import com.medshare.medshare.Enums.StatusLote;
import com.medshare.medshare.Model.Farmacia;
import com.medshare.medshare.Model.Lote;
import com.medshare.medshare.Model.Medicamento;
import com.medshare.medshare.Repository.FarmaciaRepository;
import com.medshare.medshare.Repository.LoteRepository;
import com.medshare.medshare.Repository.MedicamentoRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class LoteService {

    private final LoteRepository loteRepository;
    private final MedicamentoRepository medicamentoRepository;
    private final FarmaciaRepository farmaciaRepository;

    public LoteService(LoteRepository loteRepository,MedicamentoRepository medicamentoRepository,FarmaciaRepository farmaciaRepository){
        this.loteRepository = loteRepository;
        this.medicamentoRepository = medicamentoRepository;
        this.farmaciaRepository = farmaciaRepository;
    }

    public StatusLote classificar(LocalDate dataValidade){
        long dias = ChronoUnit.DAYS.between(LocalDate.now(),dataValidade);
        if(dias > 90){
            return StatusLote.NORMAL;
        }else if(dias >= 30){
            return StatusLote.DESCONTO;
        } else if (dias >= 0) {
            return StatusLote.DISPONIVEL_DOACAO;
        }
        else{
            return StatusLote.VENCIDO;
        }
    }
    public BigDecimal calcularDesconto(LocalDate dataValidade){
        long dias = ChronoUnit.DAYS.between(LocalDate.now(),dataValidade);
        if(dias > 90 || dias < 30){
            return BigDecimal.ZERO;
        }

        BigDecimal diasNaFaixa = BigDecimal.valueOf(90 - dias);

        BigDecimal subida = diasNaFaixa.multiply(BigDecimal.valueOf(40)).divide(BigDecimal.valueOf(60),2, RoundingMode.HALF_UP);

        return BigDecimal.valueOf(10).add(subida);

    }

    public Lote cadastrarLote(long idMedicamento,long idFarmacia,int quantidade,LocalDate dataValidade,BigDecimal precoOriginal){
        Farmacia farmacia = farmaciaRepository.findById(idFarmacia).orElseThrow(() -> new IllegalArgumentException("Farmacia nao encontrada"));

        Medicamento medicamento = medicamentoRepository.findById(idMedicamento).orElseThrow(() -> new IllegalArgumentException("Medicamento nao encontrado"));

        if(!farmacia.isAprovado()){
            throw new IllegalStateException("Farmacia ainda nao foi aprovada pelo Administrador");
        }

        if(quantidade <= 0){
            throw new IllegalArgumentException("A quantidade deve ser maior que zero");
        }
        if(precoOriginal.compareTo(BigDecimal.ZERO) < 0){
            throw new IllegalArgumentException("O preco nao pode ser negativo");
        }

        StatusLote status = classificar(dataValidade);
        if(status == StatusLote.VENCIDO){
            throw new IllegalArgumentException("Nao e possivel cadastrar lote vencido");
        }

        Lote lote = new Lote();
        lote.setFarmacia(farmacia);
        lote.setMedicamento(medicamento);
        lote.setDataValidade(dataValidade);
        lote.setQuantidade(quantidade);
        lote.setPrecoOriginal(precoOriginal);

        lote.setStatus(status);
        lote.setPercentualDesconto(calcularDesconto(dataValidade));


        return loteRepository.save(lote);

    }

    public int atualizarLotes(){
        List<Lote> lotes =loteRepository.findAll();
        int atualizados = 0;

       for(Lote lote: lotes){

           if(lote.getQuantidade() <=0){
               continue;
           }

           StatusLote novoStatus = classificar(lote.getDataValidade());
           BigDecimal novoDesconto = calcularDesconto(lote.getDataValidade());

           boolean mudouStatus = novoStatus !=lote.getStatus();
           boolean mudouDesconto =  novoDesconto.compareTo(lote.getPercentualDesconto()) != 0;

           if(mudouStatus || mudouDesconto){
               lote.setStatus(novoStatus);
               lote.setPercentualDesconto(novoDesconto);
               loteRepository.save(lote);
               atualizados++;
           }

       }

       return atualizados;

    }

}
