package br.pucminas.moedaestudantil.config;

import br.pucminas.moedaestudantil.model.InstituicaoEnsino;
import br.pucminas.moedaestudantil.model.Professor;
import br.pucminas.moedaestudantil.repository.InstituicaoRepository;
import br.pucminas.moedaestudantil.model.Usuario;
import br.pucminas.moedaestudantil.repository.ProfessorRepository;
import br.pucminas.moedaestudantil.repository.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * Inicializador de dados pre-cadastrados conforme RN02 (Instituicoes de Ensino)
 * e RN03 (Professores enviados na parceria).
 */
@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner carregarDadosPreCadastrados(
            InstituicaoRepository instituicaoRepository,
            ProfessorRepository professorRepository,
            UsuarioRepository usuarioRepository) {
        return args -> {
            // Bancos criados antes da Sprint 3 guardavam a senha em texto: converte para BCrypt
            List<Usuario> semHash = usuarioRepository.findAll().stream()
                    .filter(u -> !u.isSenhaComHash())
                    .toList();
            semHash.forEach(u -> u.definirSenha(u.getSenhaHash()));
            usuarioRepository.saveAll(semHash);

            if (instituicaoRepository.count() == 0) {
                InstituicaoEnsino pucMinas = instituicaoRepository.save(
                        new InstituicaoEnsino("Pontifícia Universidade Católica de Minas Gerais (PUC Minas)")
                );
                InstituicaoEnsino ufmg = instituicaoRepository.save(
                        new InstituicaoEnsino("Universidade Federal de Minas Gerais (UFMG)")
                );
                InstituicaoEnsino cefet = instituicaoRepository.save(
                        new InstituicaoEnsino("Centro Federal de Educação Tecnológica de Minas Gerais (CEFET-MG)")
                );

                if (professorRepository.count() == 0) {
                    Professor profMilena = new Professor();
                    profMilena.setLogin("milena.adao");
                    profMilena.definirSenha("123456");
                    profMilena.setNome("Profa. Milena Menezes Adão");
                    profMilena.setCpf("111.222.333-44");
                    profMilena.setDepartamento("Engenharia de Software");
                    profMilena.setSaldoMoedas(1000);
                    profMilena.setInstituicaoEnsino(pucMinas);

                    Professor profCarlos = new Professor();
                    profCarlos.setLogin("carlos.silva");
                    profCarlos.definirSenha("123456");
                    profCarlos.setNome("Prof. Carlos Eduardo Silva");
                    profCarlos.setCpf("555.666.777-88");
                    profCarlos.setDepartamento("Ciência da Computação");
                    profCarlos.setSaldoMoedas(1000);
                    profCarlos.setInstituicaoEnsino(ufmg);

                    professorRepository.saveAll(List.of(profMilena, profCarlos));
                }
            }
        };
    }
}
