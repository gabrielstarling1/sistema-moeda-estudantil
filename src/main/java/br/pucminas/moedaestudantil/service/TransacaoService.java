package br.pucminas.moedaestudantil.service;

import br.pucminas.moedaestudantil.dto.CupomDTO;
import br.pucminas.moedaestudantil.dto.ExtratoDTO;
import br.pucminas.moedaestudantil.dto.ResgateRequestDTO;
import br.pucminas.moedaestudantil.dto.TransacaoDTO;
import br.pucminas.moedaestudantil.dto.TransferenciaRequestDTO;
import br.pucminas.moedaestudantil.dto.UsuarioSessao;
import br.pucminas.moedaestudantil.model.Aluno;
import br.pucminas.moedaestudantil.model.Cupom;
import br.pucminas.moedaestudantil.model.Extrato;
import br.pucminas.moedaestudantil.model.Professor;
import br.pucminas.moedaestudantil.model.ResgateVantagem;
import br.pucminas.moedaestudantil.model.Transacao;
import br.pucminas.moedaestudantil.model.TransferenciaMoedas;
import br.pucminas.moedaestudantil.model.Vantagem;
import br.pucminas.moedaestudantil.repository.AlunoRepository;
import br.pucminas.moedaestudantil.repository.CupomRepository;
import br.pucminas.moedaestudantil.repository.ProfessorRepository;
import br.pucminas.moedaestudantil.repository.TransacaoRepository;
import br.pucminas.moedaestudantil.repository.VantagemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.Comparator;
import java.util.List;

@Service
public class TransacaoService {

    private static final String ALFABETO_CUPOM = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    private final TransacaoRepository transacaoRepository;
    private final AlunoRepository alunoRepository;
    private final ProfessorRepository professorRepository;
    private final VantagemRepository vantagemRepository;
    private final CupomRepository cupomRepository;
    private final EmailService emailService;
    private final SecureRandom random = new SecureRandom();

    public TransacaoService(TransacaoRepository transacaoRepository,
                            AlunoRepository alunoRepository,
                            ProfessorRepository professorRepository,
                            VantagemRepository vantagemRepository,
                            CupomRepository cupomRepository,
                            EmailService emailService) {
        this.transacaoRepository = transacaoRepository;
        this.alunoRepository = alunoRepository;
        this.professorRepository = professorRepository;
        this.vantagemRepository = vantagemRepository;
        this.cupomRepository = cupomRepository;
        this.emailService = emailService;
    }

    @Transactional(readOnly = true)
    public List<TransacaoDTO> listarTodas() {
        return transacaoRepository.findAll().stream()
                .map(t -> TransacaoDTO.de(t, null))
                .sorted(Comparator.comparing(TransacaoDTO::dataHora).reversed())
                .toList();
    }

    /**
     * RN05 e RN06: o professor envia moedas com motivo obrigatorio e o aluno e notificado por e-mail.
     */
    @Transactional
    public TransacaoDTO enviarMoedas(Long professorId, TransferenciaRequestDTO dto) {
        Professor professor = professorRepository.findById(professorId)
                .orElseThrow(() -> new IllegalArgumentException("Professor não encontrado."));
        Aluno aluno = alunoRepository.findById(dto.getAlunoId())
                .orElseThrow(() -> new IllegalArgumentException("Aluno selecionado não encontrado."));

        TransferenciaMoedas transferencia = professor.enviarMoedas(aluno, dto.getValor(), dto.getMotivo().trim());
        transacaoRepository.save(transferencia);

        emailService.enviarNotificacaoTransferencia(aluno, professor, transferencia.getValor(), transferencia.getMotivo());
        return TransacaoDTO.de(transferencia, "PROFESSOR");
    }

    /**
     * RN09 e RN10: debita o custo do saldo do aluno, gera um cupom com codigo unico
     * e envia o cupom ao aluno e o e-mail de conferencia ao parceiro.
     */
    @Transactional
    public TransacaoDTO resgatarVantagem(Long alunoId, ResgateRequestDTO dto) {
        Aluno aluno = alunoRepository.findById(alunoId)
                .orElseThrow(() -> new IllegalArgumentException("Aluno não encontrado."));
        Vantagem vantagem = vantagemRepository.findById(dto.getVantagemId())
                .orElseThrow(() -> new IllegalArgumentException("Vantagem selecionada não encontrada."));

        aluno.debitarMoedas(vantagem.getCustoMoedas());

        ResgateVantagem resgate = new ResgateVantagem(aluno, vantagem);
        Cupom cupom = new Cupom(gerarCodigoCupom(), resgate);
        resgate.setCupom(cupom);
        transacaoRepository.save(resgate);

        emailService.enviarCupomAluno(aluno, vantagem, cupom.getCodigo());
        emailService.enviarConferenciaParceiro(vantagem.getEmpresaParceira(), aluno, vantagem, cupom.getCodigo());
        return TransacaoDTO.de(resgate, "ALUNO");
    }

    /**
     * RN07: extrato com saldo e transacoes (professor: envios; aluno: recebimentos e trocas).
     */
    @Transactional(readOnly = true)
    public ExtratoDTO consultarExtrato(UsuarioSessao sessao) {
        sessao.exigirTipo("ALUNO", "PROFESSOR");

        String nome;
        Extrato extrato;
        if (sessao.isTipo("ALUNO")) {
            Aluno aluno = alunoRepository.findById(sessao.id())
                    .orElseThrow(() -> new IllegalArgumentException("Aluno não encontrado."));
            nome = aluno.getNome();
            extrato = aluno.consultarExtrato();
        } else {
            Professor professor = professorRepository.findById(sessao.id())
                    .orElseThrow(() -> new IllegalArgumentException("Professor não encontrado."));
            nome = professor.getNome();
            extrato = professor.consultarExtrato();
        }

        List<TransacaoDTO> transacoes = extrato.getTransacoes().stream()
                .sorted(Comparator.comparing(Transacao::getDataHora).reversed())
                .map(t -> TransacaoDTO.de(t, sessao.tipoUsuario()))
                .toList();
        return new ExtratoDTO(nome, sessao.tipoUsuario(), extrato.getSaldoAtual(), transacoes);
    }

    @Transactional(readOnly = true)
    public List<CupomDTO> listarCuponsDaEmpresa(Long empresaId) {
        return transacaoRepository.findResgatesPorEmpresa(empresaId).stream()
                .map(CupomDTO::de)
                .toList();
    }

    /**
     * Conferencia presencial: a empresa confirma o codigo recebido por e-mail e marca o cupom como utilizado.
     */
    @Transactional
    public CupomDTO utilizarCupom(Long empresaId, String codigo) {
        Cupom cupom = cupomRepository.findByCodigo(codigo.trim().toUpperCase())
                .orElseThrow(() -> new IllegalArgumentException("Cupom não encontrado. Confira o código informado."));
        ResgateVantagem resgate = cupom.getResgateVantagem();
        if (!resgate.getVantagem().getEmpresaParceira().getId().equals(empresaId)) {
            throw new IllegalArgumentException("Este cupom pertence a outra empresa parceira.");
        }
        cupom.utilizar();
        return CupomDTO.de(resgate);
    }

    private String gerarCodigoCupom() {
        String codigo;
        do {
            StringBuilder sb = new StringBuilder("ME-");
            for (int i = 0; i < 8; i++) {
                sb.append(ALFABETO_CUPOM.charAt(random.nextInt(ALFABETO_CUPOM.length())));
            }
            codigo = sb.toString();
        } while (cupomRepository.existsByCodigo(codigo));
        return codigo;
    }
}
