package com.medshare.medshare.Repository;

import com.medshare.medshare.Model.Farmacia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FarmaciaRepository extends JpaRepository<Farmacia,Long> {
}
