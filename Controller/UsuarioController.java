package com.medshare.medshare.Controller;


import com.medshare.medshare.DTO.ClienteRequest;
import com.medshare.medshare.DTO.FarmaciaRequest;
import com.medshare.medshare.DTO.OngRequest;
import com.medshare.medshare.Model.Cliente;
import com.medshare.medshare.Model.Farmacia;
import com.medshare.medshare.Model.Ong;
import com.medshare.medshare.Service.UsuarioService;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(origins = "http://localhost:5137")
@RequestMapping("/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService){
        this.usuarioService = usuarioService;
    }

    @PostMapping("/clientes")
    public Cliente cadastrarCliente(@RequestBody ClienteRequest request){
        return usuarioService.cadastrarCliente(request);
    }

    @PostMapping("/farmacias")
    public Farmacia cadastrarFarmacia(@RequestBody FarmaciaRequest request){
        return usuarioService.cadastrarFarmacia(request);
    }
    @PostMapping("/ongs")
    public Ong cadastrarOng(@RequestBody OngRequest request){
        return usuarioService.cadastrarOng(request);
    }



}
