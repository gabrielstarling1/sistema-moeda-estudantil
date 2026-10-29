package br.pucminas.moedaestudantil.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class TransferenciaRequestDTO {

    @NotNull(message = "Selecione o aluno que receberá as moedas.")
    private Long alunoId;

    @NotNull(message = "Informe a quantidade de moedas.")
    @Positive(message = "A quantidade de moedas deve ser maior que zero.")
    private Integer valor;

    @NotBlank(message = "O motivo do reconhecimento é obrigatório.")
    private String motivo;

    public TransferenciaRequestDTO() {
    }

    public Long getAlunoId() {
        return alunoId;
    }

    public void setAlunoId(Long alunoId) {
        this.alunoId = alunoId;
    }

    public Integer getValor() {
        return valor;
    }

    public void setValor(Integer valor) {
        this.valor = valor;
    }

    public String getMotivo() {
        return motivo;
    }

    public void setMotivo(String motivo) {
        this.motivo = motivo;
    }
}
