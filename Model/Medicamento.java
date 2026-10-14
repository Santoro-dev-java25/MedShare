package com.medshare.medshare.Model;

import com.medshare.medshare.Enums.TipoTarja;
import jakarta.persistence.*;


@Entity
@Table(name = "medicamento")
public class Medicamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Column(nullable = false)
    private String principioAtivo;

    @Column(nullable = false)
    private String categoria;

    @Enumerated(EnumType.STRING)
    private TipoTarja tipoTarja = TipoTarja.LIVRE;

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getPrincipioAtivo() {
        return principioAtivo;
    }

    public void setPrincipioAtivo(String principioAtivo) {
        this.principioAtivo = principioAtivo;
    }

    public String getCategoria() {
        return categoria;
    }

    public void setCategoria(String categoria) {
        this.categoria = categoria;
    }

    public Long getId() {
        return id;
    }

    public TipoTarja getTipoTarja() {
        return tipoTarja;
    }
    public void setTipoTarja(TipoTarja tipoTarja){
        this.tipoTarja = tipoTarja;
    }
}
