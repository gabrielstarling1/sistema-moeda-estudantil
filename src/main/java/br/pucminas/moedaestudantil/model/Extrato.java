package br.pucminas.moedaestudantil.model;

import java.util.List;

/**
 * Classe Extrato conforme Diagrama de Classes da Sprint 1.
 * Representa a projecao do saldo atual e historico de transacoes de um Aluno ou Professor.
 */
public class Extrato {

    private int saldoAtual;
    private List<Transacao> transacoes;

    public Extrato() {
    }

    public Extrato(int saldoAtual, List<Transacao> transacoes) {
        this.saldoAtual = saldoAtual;
        this.transacoes = transacoes;
    }

    public int getSaldoAtual() {
        return saldoAtual;
    }

    public void setSaldoAtual(int saldoAtual) {
        this.saldoAtual = saldoAtual;
    }

    public List<Transacao> getTransacoes() {
        return transacoes;
    }

    public void setTransacoes(List<Transacao> transacoes) {
        this.transacoes = transacoes;
    }
}
