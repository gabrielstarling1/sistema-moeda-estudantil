package br.pucminas.moedaestudantil.service;

import br.pucminas.moedaestudantil.dto.AuthResponseDTO;
import br.pucminas.moedaestudantil.dto.LoginRequestDTO;
import br.pucminas.moedaestudantil.model.Aluno;
import br.pucminas.moedaestudantil.model.EmpresaParceira;
import br.pucminas.moedaestudantil.model.Professor;
import br.pucminas.moedaestudantil.model.Usuario;
import br.pucminas.moedaestudantil.repository.UsuarioRepository;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;

    public AuthService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    public AuthResponseDTO autenticar(LoginRequestDTO dto) {
        Usuario usuario = usuarioRepository.findByLogin(dto.getLogin())
                .orElseThrow(() -> new IllegalArgumentException("Credenciais inválidas. Verifique seu login e senha."));

        if (!usuario.autenticar(dto.getLogin(), dto.getSenha())) {
            throw new IllegalArgumentException("Credenciais inválidas. Verifique seu login e senha.");
        }

        String nome = usuario.getLogin();
        String tipo = "USUARIO";

        if (usuario instanceof Aluno aluno) {
            nome = aluno.getNome();
            tipo = "ALUNO";
        } else if (usuario instanceof Professor professor) {
            nome = professor.getNome();
            tipo = "PROFESSOR";
        } else if (usuario instanceof EmpresaParceira empresa) {
            nome = empresa.getNome();
            tipo = "EMPRESA";
        }

        return new AuthResponseDTO(
                usuario.getId(),
                usuario.getLogin(),
                nome,
                tipo,
                "Autenticação realizada com sucesso!"
        );
    }
}
