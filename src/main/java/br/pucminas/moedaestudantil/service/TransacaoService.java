package br.pucminas.moedaestudantil.service;

import br.pucminas.moedaestudantil.model.Transacao;
import br.pucminas.moedaestudantil.repository.TransacaoRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TransacaoService {

    private final TransacaoRepository transacaoRepository;
    private final EmailService emailService;

    public TransacaoService(TransacaoRepository transacaoRepository, EmailService emailService) {
        this.transacaoRepository = transacaoRepository;
        this.emailService = emailService;
    }

    public List<Transacao> listarTodas() {
        return transacaoRepository.findAll();
    }
}
