package br.pucminas.moedaestudantil.service;

import br.pucminas.moedaestudantil.dto.VantagemRequestDTO;
import br.pucminas.moedaestudantil.model.EmpresaParceira;
import br.pucminas.moedaestudantil.model.Vantagem;
import br.pucminas.moedaestudantil.repository.EmpresaRepository;
import br.pucminas.moedaestudantil.repository.TransacaoRepository;
import br.pucminas.moedaestudantil.repository.VantagemRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class VantagemService {

    private static final Logger log = LoggerFactory.getLogger(VantagemService.class);
    private static final int TAMANHO_MAXIMO_FOTO = 2 * 1024 * 1024;
    private static final Map<String, String> EXTENSOES = Map.of(
            "image/png", ".png",
            "image/jpeg", ".jpg",
            "image/webp", ".webp",
            "image/gif", ".gif"
    );

    private final VantagemRepository vantagemRepository;
    private final EmpresaRepository empresaRepository;
    private final TransacaoRepository transacaoRepository;
    private final Path pastaFotos;

    public VantagemService(VantagemRepository vantagemRepository,
                           EmpresaRepository empresaRepository,
                           TransacaoRepository transacaoRepository,
                           @Value("${app.uploads.dir:uploads}") String pastaUploads) {
        this.vantagemRepository = vantagemRepository;
        this.empresaRepository = empresaRepository;
        this.transacaoRepository = transacaoRepository;
        this.pastaFotos = Paths.get(pastaUploads, "vantagens");
    }

    public List<Vantagem> listarTodas() {
        return vantagemRepository.findAll();
    }

    public List<Vantagem> listarPorEmpresa(Long empresaId) {
        return vantagemRepository.findByEmpresaParceiraId(empresaId);
    }

    public Vantagem buscarPorId(Long id) {
        return vantagemRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Vantagem não encontrada com ID: " + id));
    }

    @Transactional
    public Vantagem cadastrar(Long empresaId, VantagemRequestDTO dto) {
        EmpresaParceira empresa = empresaRepository.findById(empresaId)
                .orElseThrow(() -> new IllegalArgumentException("Empresa parceira não encontrada."));
        if (dto.getFoto() == null || dto.getFoto().isBlank()) {
            throw new IllegalArgumentException("A foto do produto é obrigatória.");
        }

        Vantagem vantagem = new Vantagem();
        vantagem.setNome(dto.getNome().trim());
        vantagem.setDescricao(dto.getDescricao().trim());
        vantagem.setCustoMoedas(dto.getCustoMoedas());
        vantagem.setFoto(salvarFoto(dto.getFoto()));
        vantagem.setEmpresaParceira(empresa);

        return vantagemRepository.save(vantagem);
    }

    @Transactional
    public Vantagem atualizar(Long id, Long empresaId, VantagemRequestDTO dto) {
        Vantagem vantagem = buscarDaEmpresa(id, empresaId);

        vantagem.setNome(dto.getNome().trim());
        vantagem.setDescricao(dto.getDescricao().trim());
        vantagem.setCustoMoedas(dto.getCustoMoedas());
        if (dto.getFoto() != null && !dto.getFoto().isBlank() && !dto.getFoto().equals(vantagem.getFoto())) {
            String fotoAntiga = vantagem.getFoto();
            vantagem.setFoto(salvarFoto(dto.getFoto()));
            removerFoto(fotoAntiga);
        }

        return vantagemRepository.save(vantagem);
    }

    @Transactional
    public void excluir(Long id, Long empresaId) {
        Vantagem vantagem = buscarDaEmpresa(id, empresaId);
        if (transacaoRepository.contarResgatesPorVantagem(id) > 0) {
            throw new IllegalStateException("Esta vantagem já foi resgatada por alunos e não pode ser excluída, pois faz parte do histórico dos extratos.");
        }
        vantagemRepository.delete(vantagem);
        removerFoto(vantagem.getFoto());
    }

    private Vantagem buscarDaEmpresa(Long id, Long empresaId) {
        Vantagem vantagem = buscarPorId(id);
        if (!vantagem.getEmpresaParceira().getId().equals(empresaId)) {
            throw new IllegalArgumentException("Esta vantagem pertence a outra empresa parceira.");
        }
        return vantagem;
    }

    /**
     * Aceita a foto como data URL (enviada pela tela) e grava em disco, ou uma URL http(s) ja existente.
     * Retorna o caminho guardado no campo foto da Vantagem.
     */
    private String salvarFoto(String foto) {
        if (foto.startsWith("data:")) {
            int virgula = foto.indexOf(',');
            String cabecalho = virgula > 0 ? foto.substring(5, virgula) : "";
            String tipo = cabecalho.replace(";base64", "");
            String extensao = EXTENSOES.get(tipo);
            if (extensao == null || !cabecalho.endsWith(";base64")) {
                throw new IllegalArgumentException("Formato de imagem não suportado. Use PNG, JPG, WEBP ou GIF.");
            }
            byte[] bytes;
            try {
                bytes = Base64.getDecoder().decode(foto.substring(virgula + 1));
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Não foi possível ler a imagem enviada.");
            }
            if (bytes.length > TAMANHO_MAXIMO_FOTO) {
                throw new IllegalArgumentException("A foto deve ter no máximo 2 MB.");
            }
            try {
                Files.createDirectories(pastaFotos);
                String nomeArquivo = UUID.randomUUID() + extensao;
                Files.write(pastaFotos.resolve(nomeArquivo), bytes);
                return "/uploads/vantagens/" + nomeArquivo;
            } catch (IOException e) {
                throw new IllegalStateException("Não foi possível salvar a foto da vantagem.");
            }
        }
        if ((foto.startsWith("http://") || foto.startsWith("https://")) && foto.length() <= 500) {
            return foto;
        }
        throw new IllegalArgumentException("Envie uma foto válida para a vantagem.");
    }

    private void removerFoto(String foto) {
        if (foto == null || !foto.startsWith("/uploads/vantagens/")) {
            return;
        }
        try {
            Files.deleteIfExists(pastaFotos.resolve(foto.substring("/uploads/vantagens/".length())));
        } catch (IOException e) {
            log.warn("Não foi possível remover a foto {}: {}", foto, e.getMessage());
        }
    }
}
