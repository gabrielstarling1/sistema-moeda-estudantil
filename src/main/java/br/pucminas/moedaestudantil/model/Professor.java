package br.pucminas.moedaestudantil.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "professores")
@PrimaryKeyJoinColumn(name = "usuario_id")
@DiscriminatorValue("PROFESSOR")
public class Professor extends Usuario {

    @Column(nullable = false, length = 150)
    private String nome;

    @Column(nullable = false, unique = true, length = 14)
    private String cpf;

    @Column(nullable = false, length = 120)
    private String departamento;

    @Column(name = "saldo_moedas", nullable = false)
    private int saldoMoedas = 1000;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "instituicao_id", nullable = false)
    private InstituicaoEnsino instituicaoEnsino;

    @JsonIgnore
    @OneToMany(mappedBy = "professor", fetch = FetchType.LAZY)
    private List<TransferenciaMoedas> envios = new ArrayList<>();

    public Professor() {
    }

    public void creditarSemestre() {
        this.saldoMoedas += 1000;
    }

    public TransferenciaMoedas enviarMoedas(Aluno aluno, int valor, String motivo) {
        if (valor <= 0) {
            throw new IllegalArgumentException("O valor de moedas deve ser positivo.");
        }
        if (motivo == null || motivo.isBlank()) {
            throw new IllegalArgumentException("O motivo do reconhecimento é obrigatório.");
        }
        if (this.saldoMoedas < valor) {
            throw new IllegalStateException("Saldo insuficiente para realizar o envio.");
        }
        this.saldoMoedas -= valor;
        aluno.receberMoedas(valor);
        return new TransferenciaMoedas(this, aluno, valor, motivo);
    }

    public Extrato consultarExtrato() {
        List<Transacao> todas = new ArrayList<>();
        if (envios != null) {
            todas.addAll(envios);
        }
        return new Extrato(this.saldoMoedas, todas);
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getCpf() {
        return cpf;
    }

    public void setCpf(String cpf) {
        this.cpf = cpf;
    }

    public String getDepartamento() {
        return departamento;
    }

    public void setDepartamento(String departamento) {
        this.departamento = departamento;
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

    public List<TransferenciaMoedas> getEnvios() {
        return envios;
    }

    public void setEnvios(List<TransferenciaMoedas> envios) {
        this.envios = envios;
    }
}
