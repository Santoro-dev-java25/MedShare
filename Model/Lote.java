package com.medshare.medshare.Model;


import com.medshare.medshare.Enums.StatusLote;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "lote")

public class Lote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "id_medicamento",nullable = false)
    private Medicamento medicamento;

    @ManyToOne
    @JoinColumn(name = "id_farmacia",nullable = false)
    private Farmacia farmacia;

    @Column(nullable = false)
    private int quantidade;

    @Column(nullable = false)
    private LocalDate dataValidade;

    @Column(nullable = false,precision = 10, scale = 2)
    private BigDecimal precoOriginal;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private StatusLote status = StatusLote.NORMAL;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal percentualDesconto = BigDecimal.ZERO;


    public int getQuantidade() {
        return quantidade;
    }

    public void setQuantidade(int quantidade) {
        this.quantidade = quantidade;
    }

    public LocalDate getDataValidade() {
        return dataValidade;
    }

    public void setDataValidade(LocalDate dataValidade) {
        this.dataValidade = dataValidade;
    }

    public BigDecimal getPrecoOriginal() {
        return precoOriginal;
    }

    public void setPrecoOriginal(BigDecimal precoOriginal) {
        this.precoOriginal = precoOriginal;
    }

    public StatusLote getStatus() {
        return status;
    }

    public void setStatus(StatusLote status) {
        this.status = status;
    }

    public BigDecimal getPercentualDesconto() {
        return percentualDesconto;
    }

    public void setPercentualDesconto(BigDecimal percentualDesconto) {
        this.percentualDesconto = percentualDesconto;
    }

    public Long getId() {
        return id;
    }

    public Medicamento getMedicamento() {
        return medicamento;
    }

    public void setMedicamento(Medicamento medicamento) {
        this.medicamento = medicamento;
    }

    public Farmacia getFarmacia() {
        return farmacia;
    }

    public void setFarmacia(Farmacia farmacia) {
        this.farmacia = farmacia;
    }
}
