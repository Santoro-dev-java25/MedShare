package com.medshare.medshare.Controller;


import com.medshare.medshare.DTO.VendaRequest;
import com.medshare.medshare.Model.Venda;
import com.medshare.medshare.Service.VendaService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/vendas")
@CrossOrigin(origins = "http://localhost:5173")
public class VendaController {

    private final VendaService vendaService;

    public VendaController(VendaService vendaService){
        this.vendaService = vendaService;
    }

    @PostMapping
    public Venda realizarVenda(@RequestBody VendaRequest venda){
        return vendaService.realizarVenda(
                venda.getIdLote(),
                venda.getIdCliente(),
                venda.getQuantidade()
        );
    }
    //Ira pegar o que recebeu do front em Json, transformar um obj no DTO e passar p metodo

}
