package br.pucminas.moedaestudantil.controller;

import br.pucminas.moedaestudantil.config.AuthInterceptor;
import br.pucminas.moedaestudantil.dto.AuthResponseDTO;
import br.pucminas.moedaestudantil.dto.LoginRequestDTO;
import br.pucminas.moedaestudantil.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody LoginRequestDTO dto) {
        return ResponseEntity.ok(authService.autenticar(dto));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request) {
        authService.encerrarSessao(AuthInterceptor.extrairToken(request));
        return ResponseEntity.noContent().build();
    }
}
