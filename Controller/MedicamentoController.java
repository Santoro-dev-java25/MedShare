package com.medshare.medshare.Controller;

import com.medshare.medshare.DTO.MedicamentoRequest;
import com.medshare.medshare.Model.Medicamento;
import com.medshare.medshare.Repository.MedicamentoRepository;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/medicamentos")
public class MedicamentoController {

    private final MedicamentoRepository medicamentoRepository;

    public MedicamentoController(MedicamentoRepository medicamentoRepository){
        this.medicamentoRepository = medicamentoRepository;
    }

    @GetMapping
    public List<Medicamento> listar(){
        return medicamentoRepository.findAll();
    }

    @PostMapping
    public Medicamento cadastrar(@RequestBody MedicamentoRequest request){
        Medicamento medicamento = new Medicamento();
        medicamento.setNome(request.getNome());
        medicamento.setCategoria(request.getCategoria());
        medicamento.setPrincipioAtivo(request.getPrincipioAtivo());

        return medicamentoRepository.save(medicamento);
    }



}
