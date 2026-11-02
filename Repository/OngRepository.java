package com.medshare.medshare.Repository;

import com.medshare.medshare.Model.Ong;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OngRepository extends JpaRepository<Ong,Long> {

    boolean existsByCnpj(String cnpj);
}
