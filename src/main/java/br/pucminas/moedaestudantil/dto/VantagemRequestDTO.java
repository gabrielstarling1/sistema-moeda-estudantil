package br.pucminas.moedaestudantil.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class VantagemRequestDTO {

    @NotBlank(message = "O nome da vantagem é obrigatório.")
    private String nome;

    @NotBlank(message = "A descrição da vantagem é obrigatória.")
    private String descricao;

    @NotNull(message = "O custo em moedas é obrigatório.")
    @Positive(message = "O custo em moedas deve ser maior que zero.")
    private Integer custoMoedas;

    // Imagem em data URL (upload pela tela) ou URL de uma imagem ja publicada
    private String foto;

    public VantagemRequestDTO() {
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public Integer getCustoMoedas() {
        return custoMoedas;
    }

    public void setCustoMoedas(Integer custoMoedas) {
        this.custoMoedas = custoMoedas;
    }

    public String getFoto() {
        return foto;
    }

    public void setFoto(String foto) {
        this.foto = foto;
    }
}
