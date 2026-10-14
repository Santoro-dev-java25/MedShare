package com.medshare.medshare.Model;


import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "venda")
public class Venda {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "id_lote",nullable = false)
    private Lote lote;

    @ManyToOne
    @JoinColumn(name = "id_cliente",nullable = false)
    private Cliente cliente;

    @Column(nullable = false)
    private int quantidadeComprada;

    @Column(nullable = false,precision = 10,scale = 2)
    private BigDecimal precoFinal;

    @Column(nullable = false)
    private LocalDate dataVenda = LocalDate.now();

    public Cliente getCliente() {
        return cliente;
    }

    public void setCliente(Cliente cliente) {
        this.cliente = cliente;
    }

    public Lote getLote() {
        return lote;
    }

    public void setLote(Lote lote) {
        this.lote = lote;
    }

    public int getQuantidadeComprada() {
        return quantidadeComprada;
    }

    public void setQuantidadeComprada(int quantidadeComprada) {
        this.quantidadeComprada = quantidadeComprada;
    }

    public BigDecimal getPrecoFinal() {
        return precoFinal;
    }

    public void setPrecoFinal(BigDecimal precoFinal) {
        this.precoFinal = precoFinal;
    }

    public LocalDate getDataVenda() {
        return dataVenda;
    }

    public void setDataVenda(LocalDate dataVenda) {
        this.dataVenda = dataVenda;
    }

    public Long getId() {
        return id;
    }
}
