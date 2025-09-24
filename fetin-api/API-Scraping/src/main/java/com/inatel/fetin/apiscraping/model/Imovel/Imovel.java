package com.inatel.fetin.apiscraping.model.Imovel;

import jakarta.persistence.*;

@Entity
public class Imovel {
    @Id
    @Column(unique = true, nullable = false)
    private String id;

    private String titulo;
    private String preco;
    private String imagem;

    private String imobiliaria;

    public Imovel() {}

    public Imovel(String id,String titulo, String preco, String imagem, String imobiliaria) {
        this.id = id;
        this.titulo = titulo;
        this.preco = preco;
        this.imagem = imagem;
        this.imobiliaria = imobiliaria;
    }

    public String getId() { return id; }
    public String getTitulo() { return titulo; }
    public String getPreco() { return preco; }
    public String getImagem() { return imagem; }
    public String getImobiliaria() { return imobiliaria; }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public void setPreco(String preco) {
        this.preco = preco;
    }

    public void setImagem(String imagem) {
        this.imagem = imagem;
    }

    public void setImobiliaria(String imobiliaria) {
        this.imobiliaria = imobiliaria;
    }
}