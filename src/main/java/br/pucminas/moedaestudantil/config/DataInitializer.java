package br.pucminas.moedaestudantil.config;

import br.pucminas.moedaestudantil.model.InstituicaoEnsino;
import br.pucminas.moedaestudantil.model.Professor;
import br.pucminas.moedaestudantil.repository.InstituicaoRepository;
import br.pucminas.moedaestudantil.repository.ProfessorRepository;
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
            ProfessorRepository professorRepository) {
        return args -> {
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
                    profMilena.setSenhaHash("123456");
                    profMilena.setNome("Profa. Milena Menezes Adão");
                    profMilena.setCpf("111.222.333-44");
                    profMilena.setDepartamento("Engenharia de Software");
                    profMilena.setSaldoMoedas(1000);
                    profMilena.setInstituicaoEnsino(pucMinas);

                    Professor profCarlos = new Professor();
                    profCarlos.setLogin("carlos.silva");
                    profCarlos.setSenhaHash("123456");
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
