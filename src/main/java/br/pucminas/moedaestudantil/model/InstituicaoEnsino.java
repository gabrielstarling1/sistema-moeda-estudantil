package br.pucminas.moedaestudantil.model;

import jakarta.persistence.*;

@Entity
@Table(name = "instituicoes_ensino")
public class InstituicaoEnsino {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 150)
    private String nome;

    public InstituicaoEnsino() {
    }

    public InstituicaoEnsino(String nome) {
        this.nome = nome;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }
}
