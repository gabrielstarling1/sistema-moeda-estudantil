package br.pucminas.moedaestudantil.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "alunos")
@PrimaryKeyJoinColumn(name = "usuario_id")
@DiscriminatorValue("ALUNO")
public class Aluno extends Usuario {

    @Column(nullable = false, length = 150)
    private String nome;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(nullable = false, unique = true, length = 14)
    private String cpf;

    @Column(nullable = false, length = 20)
    private String rg;

    @Column(nullable = false, length = 120)
    private String curso;

    @Column(name = "saldo_moedas", nullable = false)
    private int saldoMoedas = 0;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "instituicao_id", nullable = false)
    private InstituicaoEnsino instituicaoEnsino;

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true, optional = false)
    @JoinColumn(name = "endereco_id", nullable = false, unique = true)
    private Endereco endereco;

    @JsonIgnore
    @OneToMany(mappedBy = "aluno", fetch = FetchType.LAZY)
    private List<TransferenciaMoedas> recebimentos = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "aluno", fetch = FetchType.LAZY)
    private List<ResgateVantagem> resgates = new ArrayList<>();

    public Aluno() {
    }

    public void receberMoedas(int valor) {
        if (valor <= 0) {
            throw new IllegalArgumentException("O valor recebido deve ser maior que zero.");
        }
        this.saldoMoedas += valor;
    }

    public void debitarMoedas(int valor) {
        if (valor <= 0) {
            throw new IllegalArgumentException("O valor a debitar deve ser maior que zero.");
        }
        if (this.saldoMoedas < valor) {
            throw new IllegalStateException("Saldo insuficiente de moedas.");
        }
        this.saldoMoedas -= valor;
    }

    public Extrato consultarExtrato() {
        List<Transacao> todas = new ArrayList<>();
        if (recebimentos != null) {
            todas.addAll(recebimentos);
        }
        if (resgates != null) {
            todas.addAll(resgates);
        }
        return new Extrato(this.saldoMoedas, todas);
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getCpf() {
        return cpf;
    }

    public void setCpf(String cpf) {
        this.cpf = cpf;
    }

    public String getRg() {
        return rg;
    }

    public void setRg(String rg) {
        this.rg = rg;
    }

    public String getCurso() {
        return curso;
    }

    public void setCurso(String curso) {
        this.curso = curso;
    }

    public int getSaldoMoedas() {
        return saldoMoedas;
    }

    public void setSaldoMoedas(int saldoMoedas) {
        this.saldoMoedas = saldoMoedas;
    }

    public InstituicaoEnsino getInstituicaoEnsino() {
        return instituicaoEnsino;
    }

    public void setInstituicaoEnsino(InstituicaoEnsino instituicaoEnsino) {
        this.instituicaoEnsino = instituicaoEnsino;
    }

    public Endereco getEndereco() {
        return endereco;
    }

    public void setEndereco(Endereco endereco) {
        this.endereco = endereco;
    }

    public List<TransferenciaMoedas> getRecebimentos() {
        return recebimentos;
    }

    public void setRecebimentos(List<TransferenciaMoedas> recebimentos) {
        this.recebimentos = recebimentos;
    }

    public List<ResgateVantagem> getResgates() {
        return resgates;
    }

    public void setResgates(List<ResgateVantagem> resgates) {
        this.resgates = resgates;
    }
}
