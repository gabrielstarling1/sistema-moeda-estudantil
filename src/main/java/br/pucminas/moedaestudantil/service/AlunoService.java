package br.pucminas.moedaestudantil.service;

import br.pucminas.moedaestudantil.dto.AlunoRequestDTO;
import br.pucminas.moedaestudantil.model.Aluno;
import br.pucminas.moedaestudantil.model.Endereco;
import br.pucminas.moedaestudantil.model.InstituicaoEnsino;
import br.pucminas.moedaestudantil.repository.AlunoRepository;
import br.pucminas.moedaestudantil.repository.InstituicaoRepository;
import br.pucminas.moedaestudantil.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AlunoService {

    private final AlunoRepository alunoRepository;
    private final UsuarioRepository usuarioRepository;
    private final InstituicaoRepository instituicaoRepository;

    public AlunoService(AlunoRepository alunoRepository,
                        UsuarioRepository usuarioRepository,
                        InstituicaoRepository instituicaoRepository) {
        this.alunoRepository = alunoRepository;
        this.usuarioRepository = usuarioRepository;
        this.instituicaoRepository = instituicaoRepository;
    }

    public List<Aluno> listarTodos() {
        return alunoRepository.findAll();
    }

    public Aluno buscarPorId(Long id) {
        return alunoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Aluno não encontrado com ID: " + id));
    }

    @Transactional
    public Aluno cadastrar(AlunoRequestDTO dto) {
        if (dto.getSenha() == null || dto.getSenha().isBlank()) {
            throw new IllegalArgumentException("A senha é obrigatória para o cadastro.");
        }
        if (usuarioRepository.existsByLogin(dto.getLogin())) {
            throw new IllegalArgumentException("Já existe um usuário cadastrado com este login.");
        }
        if (alunoRepository.existsByCpf(dto.getCpf())) {
            throw new IllegalArgumentException("Já existe um aluno cadastrado com este CPF.");
        }
        if (alunoRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException("Já existe um aluno cadastrado com este e-mail.");
        }

        InstituicaoEnsino instituicao = instituicaoRepository.findById(dto.getInstituicaoId())
                .orElseThrow(() -> new IllegalArgumentException("Instituição de ensino selecionada não encontrada."));

        Endereco endereco = new Endereco(
                dto.getLogradouro(),
                dto.getNumero(),
                dto.getComplemento(),
                dto.getBairro(),
                dto.getCidade(),
                dto.getUf(),
                dto.getCep()
        );

        Aluno aluno = new Aluno();
        aluno.setLogin(dto.getLogin());
        aluno.setSenhaHash(dto.getSenha());
        aluno.setNome(dto.getNome());
        aluno.setEmail(dto.getEmail());
        aluno.setCpf(dto.getCpf());
        aluno.setRg(dto.getRg());
        aluno.setCurso(dto.getCurso());
        aluno.setSaldoMoedas(0); // US01: Ao concluir, o aluno inicia com saldo 0
        aluno.setInstituicaoEnsino(instituicao);
        aluno.setEndereco(endereco);

        return alunoRepository.save(aluno);
    }

    @Transactional
    public Aluno atualizar(Long id, AlunoRequestDTO dto) {
        Aluno aluno = buscarPorId(id);

        if (!aluno.getLogin().equals(dto.getLogin()) && usuarioRepository.existsByLogin(dto.getLogin())) {
            throw new IllegalArgumentException("Já existe outro usuário cadastrado com este login.");
        }
        if (!aluno.getCpf().equals(dto.getCpf()) && alunoRepository.existsByCpf(dto.getCpf())) {
            throw new IllegalArgumentException("Já existe outro aluno cadastrado com este CPF.");
        }
        if (!aluno.getEmail().equals(dto.getEmail()) && alunoRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException("Já existe outro aluno cadastrado com este e-mail.");
        }

        InstituicaoEnsino instituicao = instituicaoRepository.findById(dto.getInstituicaoId())
                .orElseThrow(() -> new IllegalArgumentException("Instituição de ensino selecionada não encontrada."));

        aluno.setLogin(dto.getLogin());
        if (dto.getSenha() != null && !dto.getSenha().isBlank()) {
            aluno.setSenhaHash(dto.getSenha());
        }
        aluno.setNome(dto.getNome());
        aluno.setEmail(dto.getEmail());
        aluno.setCpf(dto.getCpf());
        aluno.setRg(dto.getRg());
        aluno.setCurso(dto.getCurso());
        aluno.setInstituicaoEnsino(instituicao);

        Endereco endereco = aluno.getEndereco();
        if (endereco == null) {
            endereco = new Endereco();
            aluno.setEndereco(endereco);
        }
        endereco.setLogradouro(dto.getLogradouro());
        endereco.setNumero(dto.getNumero());
        endereco.setComplemento(dto.getComplemento());
        endereco.setBairro(dto.getBairro());
        endereco.setCidade(dto.getCidade());
        endereco.setUf(dto.getUf());
        endereco.setCep(dto.getCep());

        return alunoRepository.save(aluno);
    }

    @Transactional
    public void excluir(Long id) {
        Aluno aluno = buscarPorId(id);
        alunoRepository.delete(aluno);
    }
}
