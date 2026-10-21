package br.pucminas.moedaestudantil.service;

import org.springframework.stereotype.Service;

@Service
public class EmailService {

    public void enviarNotificacaoTransferencia(String emailAluno, String nomeProfessor, int valor, String motivo) {
        System.out.printf("[SMTP EmailService] Para: %s | Assunto: Voce recebeu %d moedas do Prof. %s | Motivo: %s%n",
                emailAluno, valor, nomeProfessor, motivo);
    }

    public void enviarCupomResgate(String emailDestino, String codigoCupom, String nomeVantagem, String nomeParceiro) {
        System.out.printf("[SMTP EmailService] Para: %s | Assunto: Cupom %s - Vantagem: %s (%s)%n",
                emailDestino, codigoCupom, nomeVantagem, nomeParceiro);
    }
}
