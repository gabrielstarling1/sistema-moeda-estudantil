package br.pucminas.moedaestudantil.dto;

import java.util.List;

public record ExtratoDTO(String nome, String tipoUsuario, int saldoAtual, List<TransacaoDTO> transacoes) {
}
