package br.pucminas.moedaestudantil.service;

import br.pucminas.moedaestudantil.model.Aluno;
import br.pucminas.moedaestudantil.model.EmpresaParceira;
import br.pucminas.moedaestudantil.model.Professor;
import br.pucminas.moedaestudantil.model.Vantagem;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * Envio dos e-mails do sistema (RN06 e RN10) pelo servidor SMTP configurado em spring.mail.*.
 * Uma falha no envio e registrada no log e nao desfaz a transacao de moedas.
 */
@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final ObjectProvider<JavaMailSender> mailSender;
    private final String remetente;
    private final boolean habilitado;

    public EmailService(ObjectProvider<JavaMailSender> mailSender,
                        @Value("${app.email.remetente:nao-responda@moedaestudantil.pucminas.br}") String remetente,
                        @Value("${app.email.habilitado:true}") boolean habilitado) {
        this.mailSender = mailSender;
        this.remetente = remetente;
        this.habilitado = habilitado;
    }

    public void enviarNotificacaoTransferencia(Aluno aluno, Professor professor, int valor, String motivo) {
        String texto = """
                Olá, %s!

                Você recebeu %d moedas do(a) %s.

                Motivo do reconhecimento:
                %s

                Seu saldo atual é de %d moedas. Acesse o Sistema de Moeda Estudantil para trocá-las por vantagens.
                """.formatted(aluno.getNome(), valor, professor.getNome(), motivo, aluno.getSaldoMoedas());
        enviar(aluno.getEmail(), "Você recebeu " + valor + " moedas!", texto);
    }

    public void enviarCupomAluno(Aluno aluno, Vantagem vantagem, String codigoCupom) {
        String texto = """
                Olá, %s!

                Seu resgate da vantagem "%s" (%s) foi confirmado.

                CÓDIGO DO CUPOM: %s

                Apresente este código na troca presencial. Foram debitadas %d moedas; seu saldo atual é de %d moedas.
                """.formatted(aluno.getNome(), vantagem.getNome(), vantagem.getEmpresaParceira().getNome(),
                codigoCupom, vantagem.getCustoMoedas(), aluno.getSaldoMoedas());
        enviar(aluno.getEmail(), "Seu cupom " + codigoCupom + " - " + vantagem.getNome(), texto);
    }

    public void enviarConferenciaParceiro(EmpresaParceira empresa, Aluno aluno, Vantagem vantagem, String codigoCupom) {
        String texto = """
                Olá, %s!

                O(a) aluno(a) %s (%s) resgatou a vantagem "%s" por %d moedas.

                CÓDIGO PARA CONFERÊNCIA: %s

                Confira este código no momento da troca presencial e marque o cupom como utilizado no sistema.
                """.formatted(empresa.getNome(), aluno.getNome(), aluno.getEmail(), vantagem.getNome(),
                vantagem.getCustoMoedas(), codigoCupom);
        enviar(empresa.getEmail(), "Novo resgate para conferência - cupom " + codigoCupom, texto);
    }

    private void enviar(String destinatario, String assunto, String texto) {
        JavaMailSender sender = mailSender.getIfAvailable();
        if (!habilitado || sender == null) {
            log.info("[EmailService] Envio desabilitado. Para: {} | Assunto: {}\n{}", destinatario, assunto, texto);
            return;
        }
        try {
            SimpleMailMessage mensagem = new SimpleMailMessage();
            mensagem.setFrom(remetente);
            mensagem.setTo(destinatario);
            mensagem.setSubject(assunto);
            mensagem.setText(texto);
            sender.send(mensagem);
            log.info("[EmailService] E-mail enviado para {} | Assunto: {}", destinatario, assunto);
        } catch (Exception e) {
            log.warn("[EmailService] Falha ao enviar e-mail para {} ({}). Conteúdo:\n{}", destinatario, e.getMessage(), texto);
        }
    }
}
