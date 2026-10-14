package com.medshare.medshare.Model;

import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "doacao")
public class Doacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "id_lote",nullable = false)
    private Lote lote;

    @ManyToOne
    @JoinColumn(name = "id_ong",nullable = false)
    private Ong ong;

    @Column(nullable = false)
    private int quantidadeDoada;

    @Column(nullable = false)
    private LocalDate dataReivindicacao = LocalDate.now();

    private LocalDate dataRetirada;

    public Lote getLote() {
        return lote;
    }

    public void setLote(Lote lote) {
        this.lote = lote;
    }

    public Ong getOng() {
        return ong;
    }

    public void setOng(Ong ong) {
        this.ong = ong;
    }

    public int getQuantidadeDoada() {
        return quantidadeDoada;
    }

    public void setQuantidadeDoada(int quantidadeDoada) {
        this.quantidadeDoada = quantidadeDoada;
    }

    public LocalDate getDataReivindicacao() {
        return dataReivindicacao;
    }

    public void setDataReivindicacao(LocalDate dataReivindicacao) {
        this.dataReivindicacao = dataReivindicacao;
    }

    public LocalDate getDataRetirada() {
        return dataRetirada;
    }

    public void setDataRetirada(LocalDate dataRetirada) {
        this.dataRetirada = dataRetirada;
    }

    public Long getId() {
        return id;
    }
}
