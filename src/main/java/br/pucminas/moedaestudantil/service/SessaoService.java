package br.pucminas.moedaestudantil.service;

import br.pucminas.moedaestudantil.dto.UsuarioSessao;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Guarda os tokens de acesso emitidos no login (RN01).
 * Os tokens ficam em memoria: reiniciar a aplicacao exige novo login.
 */
@Service
public class SessaoService {

    private static final Duration VALIDADE = Duration.ofHours(8);

    private final SecureRandom random = new SecureRandom();
    private final Map<String, SessaoAtiva> sessoes = new ConcurrentHashMap<>();

    public String abrirSessao(UsuarioSessao usuario) {
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        sessoes.put(token, new SessaoAtiva(usuario, Instant.now().plus(VALIDADE)));
        return token;
    }

    public Optional<UsuarioSessao> buscar(String token) {
        if (token == null) {
            return Optional.empty();
        }
        SessaoAtiva sessao = sessoes.get(token);
        if (sessao == null) {
            return Optional.empty();
        }
        if (sessao.expiraEm().isBefore(Instant.now())) {
            sessoes.remove(token);
            return Optional.empty();
        }
        return Optional.of(sessao.usuario());
    }

    public void encerrar(String token) {
        if (token != null) {
            sessoes.remove(token);
        }
    }

    public void encerrarSessoesDoUsuario(Long usuarioId) {
        sessoes.values().removeIf(s -> s.usuario().id().equals(usuarioId));
    }

    private record SessaoAtiva(UsuarioSessao usuario, Instant expiraEm) {
    }
}
