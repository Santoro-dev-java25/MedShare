package com.medshare.medshare.Repository;

import com.medshare.medshare.Enums.StatusLote;
import com.medshare.medshare.Model.Farmacia;
import com.medshare.medshare.Model.Lote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LoteRepository extends JpaRepository<Lote,Long> {

    List<Lote> findByStatus(StatusLote status);

    List<Lote> findByFarmacia(Farmacia farmacia);
}
