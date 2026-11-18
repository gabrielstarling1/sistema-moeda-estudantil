package br.pucminas.moedaestudantil;

import br.pucminas.moedaestudantil.dto.AlunoRequestDTO;
import br.pucminas.moedaestudantil.dto.CupomDTO;
import br.pucminas.moedaestudantil.dto.EmpresaRequestDTO;
import br.pucminas.moedaestudantil.dto.ExtratoDTO;
import br.pucminas.moedaestudantil.dto.ResgateRequestDTO;
import br.pucminas.moedaestudantil.dto.TransacaoDTO;
import br.pucminas.moedaestudantil.dto.TransferenciaRequestDTO;
import br.pucminas.moedaestudantil.dto.UsuarioSessao;
import br.pucminas.moedaestudantil.dto.VantagemRequestDTO;
import br.pucminas.moedaestudantil.model.Aluno;
import br.pucminas.moedaestudantil.model.EmpresaParceira;
import br.pucminas.moedaestudantil.model.Professor;
import br.pucminas.moedaestudantil.model.Vantagem;
import br.pucminas.moedaestudantil.repository.InstituicaoRepository;
import br.pucminas.moedaestudantil.repository.ProfessorRepository;
import br.pucminas.moedaestudantil.service.AlunoService;
import br.pucminas.moedaestudantil.service.EmpresaService;
import br.pucminas.moedaestudantil.service.ProfessorService;
import br.pucminas.moedaestudantil.service.TransacaoService;
import br.pucminas.moedaestudantil.service.VantagemService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:sprint3;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DEFAULT_NULL_ORDERING=HIGH",
        "app.email.habilitado=false",
        "app.uploads.dir=target/test-uploads"
})
@ActiveProfiles("local")
@AutoConfigureMockMvc
class Sprint3FluxosTests {

    @Autowired private AlunoService alunoService;
    @Autowired private EmpresaService empresaService;
    @Autowired private VantagemService vantagemService;
    @Autowired private TransacaoService transacaoService;
    @Autowired private ProfessorService professorService;
    @Autowired private ProfessorRepository professorRepository;
    @Autowired private InstituicaoRepository instituicaoRepository;
    @Autowired private MockMvc mockMvc;

    @Test
    void deveEnviarMoedasResgatarVantagemEConferirCupom() {
        Professor professor = professorRepository.findAll().get(0);
        int saldoInicialProfessor = professor.getSaldoMoedas();
        Aluno aluno = alunoService.cadastrar(novoAluno());
        EmpresaParceira empresa = empresaService.cadastrar(novaEmpresa());

        // CRUD de vantagem pela empresa parceira
        VantagemRequestDTO vDto = new VantagemRequestDTO();
        vDto.setNome("Desconto no restaurante universitário");
        vDto.setDescricao("20% de desconto no almoço.");
        vDto.setCustoMoedas(80);
        vDto.setFoto("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==");
        Vantagem vantagem = vantagemService.cadastrar(empresa.getId(), vDto);
        assertTrue(vantagem.getFoto().startsWith("/uploads/vantagens/"));

        vDto.setCustoMoedas(60);
        vDto.setFoto(null);
        assertEquals(60, vantagemService.atualizar(vantagem.getId(), empresa.getId(), vDto).getCustoMoedas());

        // RN05: professor envia moedas com motivo
        TransferenciaRequestDTO tDto = new TransferenciaRequestDTO();
        tDto.setAlunoId(aluno.getId());
        tDto.setValor(100);
        tDto.setMotivo("Participação na apresentação do Lab 03");
        transacaoService.enviarMoedas(professor.getId(), tDto);

        assertEquals(saldoInicialProfessor - 100, professorService.buscarPorId(professor.getId()).getSaldoMoedas());
        assertEquals(100, alunoService.buscarPorId(aluno.getId()).getSaldoMoedas());

        // RN05: saldo insuficiente
        tDto.setValor(saldoInicialProfessor);
        assertThrows(IllegalStateException.class, () -> transacaoService.enviarMoedas(professor.getId(), tDto));

        // RN09 e RN10: resgate debita o saldo e gera cupom
        ResgateRequestDTO rDto = new ResgateRequestDTO();
        rDto.setVantagemId(vantagem.getId());
        TransacaoDTO resgate = transacaoService.resgatarVantagem(aluno.getId(), rDto);
        assertNotNull(resgate.codigoCupom());
        assertEquals(40, alunoService.buscarPorId(aluno.getId()).getSaldoMoedas());

        // RN07: extratos
        ExtratoDTO extratoAluno = transacaoService.consultarExtrato(new UsuarioSessao(aluno.getId(), aluno.getLogin(), "ALUNO"));
        assertEquals(40, extratoAluno.saldoAtual());
        assertEquals(2, extratoAluno.transacoes().size());

        ExtratoDTO extratoProfessor = transacaoService.consultarExtrato(new UsuarioSessao(professor.getId(), professor.getLogin(), "PROFESSOR"));
        assertEquals("ENVIO", extratoProfessor.transacoes().get(0).tipo());

        // Conferencia do cupom pela empresa
        List<CupomDTO> cupons = transacaoService.listarCuponsDaEmpresa(empresa.getId());
        assertEquals(1, cupons.size());
        assertEquals("UTILIZADO", transacaoService.utilizarCupom(empresa.getId(), resgate.codigoCupom()).status());
        assertThrows(IllegalStateException.class, () -> transacaoService.utilizarCupom(empresa.getId(), resgate.codigoCupom()));

        // Vantagem ja resgatada nao pode ser excluida
        assertThrows(IllegalStateException.class, () -> vantagemService.excluir(vantagem.getId(), empresa.getId()));
    }

    @Test
    void deveCreditarMilMoedasUmaVezPorSemestre() {
        professorService.creditarSemestreAtual(LocalDate.of(2026, 10, 1));
        Professor professor = professorRepository.findAll().get(0);
        int saldo = professor.getSaldoMoedas();

        assertEquals(0, professorService.creditarSemestreAtual(LocalDate.of(2026, 12, 1)));
        assertTrue(professorService.creditarSemestreAtual(LocalDate.of(2027, 2, 1)) > 0);
        assertEquals(saldo + 1000, professorService.buscarPorId(professor.getId()).getSaldoMoedas());
    }

    @Test
    void deveExigirLoginNaApi() throws Exception {
        mockMvc.perform(get("/api/alunos")).andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/instituicoes")).andExpect(status().isOk());
    }

    private AlunoRequestDTO novoAluno() {
        AlunoRequestDTO dto = new AlunoRequestDTO();
        dto.setNome("Rafael Nagem Volpini");
        dto.setCpf("987.654.321-00");
        dto.setRg("MG-98.765.432");
        dto.setEmail("rafael@sga.pucminas.br");
        dto.setCurso("Engenharia de Software");
        dto.setInstituicaoId(instituicaoRepository.findAll().get(0).getId());
        dto.setLogin("rafael.volpini");
        dto.setSenha("senha123");
        dto.setLogradouro("Av. Dom José Gaspar");
        dto.setNumero("500");
        dto.setBairro("Coração Eucarístico");
        dto.setCidade("Belo Horizonte");
        dto.setUf("MG");
        dto.setCep("30535-901");
        return dto;
    }

    private EmpresaRequestDTO novaEmpresa() {
        EmpresaRequestDTO dto = new EmpresaRequestDTO();
        dto.setNome("Restaurante Universitário");
        dto.setCnpj("11.222.333/0001-44");
        dto.setEmail("contato@restaurante.com.br");
        dto.setLogin("restaurante.ru");
        dto.setSenha("empresa123");
        return dto;
    }
}
