package br.pucminas.moedaestudantil.config;

import br.pucminas.moedaestudantil.service.ProfessorService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

import java.time.LocalDate;

/**
 * Verifica ao iniciar e todo dia a 00:05 se comecou um novo semestre,
 * creditando as 1.000 moedas acumulaveis dos professores (RN04).
 */
@Configuration
@EnableScheduling
public class SemestreScheduler {

    private static final Logger log = LoggerFactory.getLogger(SemestreScheduler.class);

    private final ProfessorService professorService;

    public SemestreScheduler(ProfessorService professorService) {
        this.professorService = professorService;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void verificarAoIniciar() {
        verificarNovoSemestre();
    }

    @Scheduled(cron = "0 5 0 * * *")
    public void verificarNovoSemestre() {
        int creditados = professorService.creditarSemestreAtual(LocalDate.now());
        if (creditados > 0) {
            log.info("Novo semestre {}: {} professor(es) receberam 1.000 moedas.",
                    ProfessorService.semestreDe(LocalDate.now()), creditados);
        }
    }
}
