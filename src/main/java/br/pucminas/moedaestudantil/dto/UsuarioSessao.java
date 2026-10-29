package br.pucminas.moedaestudantil.dto;

import br.pucminas.moedaestudantil.config.AcessoNegadoException;

import java.util.Arrays;

/**
 * Usuario autenticado na requisicao atual (preenchido pelo AuthInterceptor a partir do token).
 */
public record UsuarioSessao(Long id, String login, String tipoUsuario) {

    public static final String ATRIBUTO = "usuarioSessao";

    public boolean isTipo(String tipo) {
        return tipoUsuario.equals(tipo);
    }

    public void exigirTipo(String... tipos) {
        if (Arrays.stream(tipos).noneMatch(this::isTipo)) {
            throw new AcessoNegadoException("Seu perfil não tem permissão para esta operação.");
        }
    }

    public void exigirProprioCadastro(String tipo, Long idRecurso) {
        if (!isTipo(tipo) || !id.equals(idRecurso)) {
            throw new AcessoNegadoException("Você só pode alterar o seu próprio cadastro.");
        }
    }
}
