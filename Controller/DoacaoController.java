package com.medshare.medshare.Controller;


import com.medshare.medshare.DTO.DoacaoRequest;
import com.medshare.medshare.Model.Doacao;
import com.medshare.medshare.Service.DoacaoService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/doacoes")
@CrossOrigin(origins = "http://localhost:5173")
public class DoacaoController {

    private final DoacaoService doacaoService;

    public DoacaoController(DoacaoService doacaoService){
        this.doacaoService = doacaoService;
    }

    @PostMapping
    public Doacao reivindicar(@RequestBody DoacaoRequest doacao){
        return doacaoService.reivindicar(
                doacao.getIdLote(),
                doacao.getIdOng(),
                doacao.getQuantidade()
        );
    }
}
