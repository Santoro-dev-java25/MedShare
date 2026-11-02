package com.medshare.medshare.Repository;

import com.medshare.medshare.Model.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ClienteRepository extends JpaRepository<Cliente,Long> {

    boolean existsByCpf(String cpf);
}
