package com.medshare.medshare.Service;

import com.medshare.medshare.DTO.ClienteRequest;
import com.medshare.medshare.DTO.FarmaciaRequest;
import com.medshare.medshare.DTO.OngRequest;
import com.medshare.medshare.Model.Cliente;
import com.medshare.medshare.Model.Farmacia;
import com.medshare.medshare.Model.Ong;
import com.medshare.medshare.Repository.ClienteRepository;
import com.medshare.medshare.Repository.FarmaciaRepository;
import com.medshare.medshare.Repository.OngRepository;
import com.medshare.medshare.Repository.UsuarioRepository;
import org.springframework.stereotype.Service;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final FarmaciaRepository farmaciaRepository;
    private final ClienteRepository clienteRepository;
    private final OngRepository ongRepository;

    public UsuarioService(UsuarioRepository usuarioRepository,FarmaciaRepository farmaciaRepository,ClienteRepository clienteRepository,OngRepository ongRepository){
        this.usuarioRepository = usuarioRepository;
        this.farmaciaRepository = farmaciaRepository;
        this.clienteRepository = clienteRepository;
        this.ongRepository = ongRepository;
    }

    public Cliente cadastrarCliente(ClienteRequest request){
        validarEmail(request.getEmail());
        if(clienteRepository.existsByCpf(request.getCpf())){
            throw new IllegalArgumentException("CPF ja cadastrado");
        }

        Cliente cliente = new Cliente();
        cliente.setNome(request.getNome());
        cliente.setCpf(request.getCpf());
        cliente.setEmail(request.getEmail());
        cliente.setEndereco(request.getEndereco());
        cliente.setSenha(request.getSenha());

        return clienteRepository.save(cliente);

    }

    public Farmacia cadastrarFarmacia(FarmaciaRequest request){
       validarEmail(request.getEmail());

        if(farmaciaRepository.existsByCnpj(request.getCnpj())){
            throw new IllegalArgumentException("CNPJ ja cadastrado");
        }

        Farmacia farmacia = new Farmacia();
        farmacia.setEndereco(request.getEndereco());
        farmacia.setNome(request.getNome());
        farmacia.setEmail(request.getEmail());
        farmacia.setSenha(request.getSenha());
        farmacia.setCnpj(request.getCnpj());

        return farmaciaRepository.save(farmacia);
    }

    public Ong cadastrarOng(OngRequest request){
        validarEmail(request.getEmail());

        if(ongRepository.existsByCnpj(request.getCnpj())){
            throw new IllegalArgumentException("CNPJ ja cadastrado");
        }

        Ong ong = new Ong();
        ong.setCnpj(request.getCnpj());
        ong.setNome(request.getNome());
        ong.setSenha(request.getSenha());
        ong.setAreaAtuacao(request.getAreaAtuacao());
        ong.setEmail(request.getEmail());

        return ongRepository.save(ong);
    }

    private void validarEmail(String email){
        if(usuarioRepository.existsByEmail(email)){
            throw new IllegalArgumentException("Email ja cadastrado");
        }
    }


}
