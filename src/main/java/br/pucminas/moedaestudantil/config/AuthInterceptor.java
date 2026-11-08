package br.pucminas.moedaestudantil.config;

import br.pucminas.moedaestudantil.dto.UsuarioSessao;
import br.pucminas.moedaestudantil.service.SessaoService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.nio.charset.StandardCharsets;
import java.util.Optional;
import java.util.Set;

/**
 * RN01: toda rota da API exige o token recebido no login (cabecalho Authorization: Bearer ...),
 * exceto o proprio login, a lista de instituicoes e o auto cadastro de aluno e empresa.
 */
@Component
public class AuthInterceptor implements HandlerInterceptor {

    private static final Set<String> CADASTROS_PUBLICOS = Set.of("/api/alunos", "/api/empresas");

    private final SessaoService sessaoService;

    public AuthInterceptor(SessaoService sessaoService) {
        this.sessaoService = sessaoService;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String metodo = request.getMethod();
        String caminho = request.getRequestURI();

        if (HttpMethod.OPTIONS.matches(metodo)
                || (HttpMethod.POST.matches(metodo) && CADASTROS_PUBLICOS.contains(caminho))) {
            return true;
        }

        Optional<UsuarioSessao> sessao = sessaoService.buscar(extrairToken(request));
        if (sessao.isEmpty()) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setCharacterEncoding(StandardCharsets.UTF_8.name());
            response.getWriter().write("{\"erro\":\"Sessão expirada ou inexistente. Faça login novamente.\"}");
            return false;
        }

        request.setAttribute(UsuarioSessao.ATRIBUTO, sessao.get());
        return true;
    }

    public static String extrairToken(HttpServletRequest request) {
        String cabecalho = request.getHeader("Authorization");
        if (cabecalho != null && cabecalho.startsWith("Bearer ")) {
            return cabecalho.substring(7).trim();
        }
        return null;
    }
}
