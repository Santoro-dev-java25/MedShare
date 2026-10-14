package com.medshare.medshare.Model;

import com.medshare.medshare.Enums.TipoUsuario;
import jakarta.persistence.*;

@Entity
@Table(name = "admin")
@PrimaryKeyJoinColumn(name = "usuario_id")

public class Admin extends Usuario{

    public Admin() {
        setTipo(TipoUsuario.ADMIN);
    }

}
