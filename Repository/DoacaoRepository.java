package com.medshare.medshare.Repository;

import com.medshare.medshare.Model.Doacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DoacaoRepository extends JpaRepository<Doacao,Long> {
}
