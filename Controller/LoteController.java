package com.medshare.medshare.Controller;

import com.medshare.medshare.DTO.LoteRequest;
import com.medshare.medshare.Enums.StatusLote;
import com.medshare.medshare.Model.Lote;
import com.medshare.medshare.Repository.LoteRepository;
import com.medshare.medshare.Service.LoteService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/lotes")
public class LoteController {

    private final LoteRepository loteRepository;
    private final LoteService loteService;

    public LoteController(LoteRepository loteRepository,LoteService loteService){
        this.loteRepository = loteRepository;
        this.loteService = loteService;
    }

    @GetMapping
    public List<Lote> listarPorStatus(@RequestParam StatusLote status){
        return loteRepository.findByStatus(status);
    }

    @PostMapping
    public Lote cadastrarLote(@RequestBody LoteRequest request){
        return loteService.cadastrarLote(
                request.getIdMedicamento(),
                request.getIdFarmacia(),
                request.getQuantidade(),
                request.getDataValidade(),
                request.getPrecoOriginal()
        );
    }

    @PostMapping("/atualizar-status")
    public String atualizarStatus(){
        int atualizados = loteService.atualizarLotes();
        return atualizados + "lote(s) atualizado(s)";

    }


}
