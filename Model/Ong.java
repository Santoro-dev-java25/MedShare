package com.medshare.medshare.Model;

import com.medshare.medshare.Enums.TipoUsuario;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.PrimaryKeyJoinColumn;
import jakarta.persistence.Table;

@Entity
@Table(name = "ong")
@PrimaryKeyJoinColumn(name = "usuario_id")
public class Ong extends Usuario{

    public Ong(){
        setTipo(TipoUsuario.ONG);
    }

    @Column(nullable = false, unique = true)
    private String cnpj;

    @Column(nullable = false)
    private String areaAtuacao;

    @Column(nullable = false)
    private boolean aprovado;

    public String getCnpj() {
        return cnpj;
    }

    public void setCnpj(String cnpj) {
        this.cnpj = cnpj;
    }

    public String getAreaAtuacao() {
        return areaAtuacao;
    }

    public void setAreaAtuacao(String areaAtuacao) {
        this.areaAtuacao = areaAtuacao;
    }

    public boolean isAprovado() {
        return aprovado;
    }

    public void setAprovado(boolean aprovado) {
        this.aprovado = aprovado;
    }
}
