package br.pucminas.moedaestudantil.dto;

import jakarta.validation.constraints.NotNull;

public class ResgateRequestDTO {

    @NotNull(message = "Selecione a vantagem que deseja resgatar.")
    private Long vantagemId;

    public ResgateRequestDTO() {
    }

    public Long getVantagemId() {
        return vantagemId;
    }

    public void setVantagemId(Long vantagemId) {
        this.vantagemId = vantagemId;
    }
}
