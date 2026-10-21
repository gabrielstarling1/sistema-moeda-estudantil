package br.pucminas.moedaestudantil.service;

import br.pucminas.moedaestudantil.dto.EmpresaRequestDTO;
import br.pucminas.moedaestudantil.model.EmpresaParceira;
import br.pucminas.moedaestudantil.repository.EmpresaRepository;
import br.pucminas.moedaestudantil.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class EmpresaService {

    private final EmpresaRepository empresaRepository;
    private final UsuarioRepository usuarioRepository;

    public EmpresaService(EmpresaRepository empresaRepository, UsuarioRepository usuarioRepository) {
        this.empresaRepository = empresaRepository;
        this.usuarioRepository = usuarioRepository;
    }

    public List<EmpresaParceira> listarTodas() {
        return empresaRepository.findAll();
    }

    public EmpresaParceira buscarPorId(Long id) {
        return empresaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Empresa parceira não encontrada com ID: " + id));
    }

    @Transactional
    public EmpresaParceira cadastrar(EmpresaRequestDTO dto) {
        if (dto.getSenha() == null || dto.getSenha().isBlank()) {
            throw new IllegalArgumentException("A senha é obrigatória para o cadastro.");
        }
        if (usuarioRepository.existsByLogin(dto.getLogin())) {
            throw new IllegalArgumentException("Já existe um usuário cadastrado com este login.");
        }
        if (empresaRepository.existsByCnpj(dto.getCnpj())) {
            throw new IllegalArgumentException("Já existe uma empresa parceira cadastrada com este CNPJ.");
        }
        if (empresaRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException("Já existe uma empresa parceira cadastrada com este e-mail.");
        }

        EmpresaParceira empresa = new EmpresaParceira();
        empresa.setLogin(dto.getLogin());
        empresa.setSenhaHash(dto.getSenha());
        empresa.setNome(dto.getNome());
        empresa.setCnpj(dto.getCnpj());
        empresa.setEmail(dto.getEmail());

        return empresaRepository.save(empresa);
    }

    @Transactional
    public EmpresaParceira atualizar(Long id, EmpresaRequestDTO dto) {
        EmpresaParceira empresa = buscarPorId(id);

        if (!empresa.getLogin().equals(dto.getLogin()) && usuarioRepository.existsByLogin(dto.getLogin())) {
            throw new IllegalArgumentException("Já existe outro usuário cadastrado com este login.");
        }
        if (!empresa.getCnpj().equals(dto.getCnpj()) && empresaRepository.existsByCnpj(dto.getCnpj())) {
            throw new IllegalArgumentException("Já existe outra empresa parceira cadastrada com este CNPJ.");
        }
        if (!empresa.getEmail().equals(dto.getEmail()) && empresaRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException("Já existe outra empresa parceira cadastrada com este e-mail.");
        }

        empresa.setLogin(dto.getLogin());
        if (dto.getSenha() != null && !dto.getSenha().isBlank()) {
            empresa.setSenhaHash(dto.getSenha());
        }
        empresa.setNome(dto.getNome());
        empresa.setCnpj(dto.getCnpj());
        empresa.setEmail(dto.getEmail());

        return empresaRepository.save(empresa);
    }

    @Transactional
    public void excluir(Long id) {
        EmpresaParceira empresa = buscarPorId(id);
        empresaRepository.delete(empresa);
    }
}
