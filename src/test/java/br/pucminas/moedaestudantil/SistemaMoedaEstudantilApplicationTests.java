package br.pucminas.moedaestudantil;

import br.pucminas.moedaestudantil.dto.AlunoRequestDTO;
import br.pucminas.moedaestudantil.dto.EmpresaRequestDTO;
import br.pucminas.moedaestudantil.model.Aluno;
import br.pucminas.moedaestudantil.model.EmpresaParceira;
import br.pucminas.moedaestudantil.model.InstituicaoEnsino;
import br.pucminas.moedaestudantil.repository.InstituicaoRepository;
import br.pucminas.moedaestudantil.service.AlunoService;
import br.pucminas.moedaestudantil.service.EmpresaService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("local")
class SistemaMoedaEstudantilApplicationTests {

    @Autowired
    private AlunoService alunoService;

    @Autowired
    private EmpresaService empresaService;

    @Autowired
    private InstituicaoRepository instituicaoRepository;

    @Test
    void deveExecutarCrudCompletoDeAlunoEEmpresaParceira() {
        List<InstituicaoEnsino> instituicoes = instituicaoRepository.findAll();
        assertFalse(instituicoes.isEmpty(), "Deve possuir instituicoes pre-cadastradas (RN02)");

        // 1. Cadastrar Aluno (US01)
        AlunoRequestDTO alunoDto = new AlunoRequestDTO();
        alunoDto.setNome("Bernardo Parreiras Prado");
        alunoDto.setCpf("123.456.789-00");
        alunoDto.setRg("MG-12.345.678");
        alunoDto.setEmail("bernardo@sga.pucminas.br");
        alunoDto.setCurso("Engenharia de Software");
        alunoDto.setInstituicaoId(instituicoes.get(0).getId());
        alunoDto.setLogin("bernardo.prado");
        alunoDto.setSenha("senha123");
        alunoDto.setLogradouro("Av. Dom José Gaspar");
        alunoDto.setNumero("500");
        alunoDto.setComplemento("Prédio 34");
        alunoDto.setBairro("Coração Eucarístico");
        alunoDto.setCidade("Belo Horizonte");
        alunoDto.setUf("MG");
        alunoDto.setCep("30535-901");

        Aluno alunoSalvo = alunoService.cadastrar(alunoDto);
        assertNotNull(alunoSalvo.getId());
        assertEquals(0, alunoSalvo.getSaldoMoedas());

        // 2. Atualizar Aluno (US03)
        alunoDto.setCurso("Engenharia de Software - Noite");
        Aluno alunoAtualizado = alunoService.atualizar(alunoSalvo.getId(), alunoDto);
        assertEquals("Engenharia de Software - Noite", alunoAtualizado.getCurso());

        // 3. Excluir Aluno (US03)
        alunoService.excluir(alunoSalvo.getId());
        assertEquals(0, alunoService.listarTodos().size());

        // 4. Cadastrar Empresa Parceira (US12)
        EmpresaRequestDTO empDto = new EmpresaRequestDTO();
        empDto.setNome("Livraria Universitária");
        empDto.setCnpj("12.345.678/0001-99");
        empDto.setEmail("contato@livraria.com.br");
        empDto.setLogin("livraria.parceira");
        empDto.setSenha("empresa123");

        EmpresaParceira empSalva = empresaService.cadastrar(empDto);
        assertNotNull(empSalva.getId());

        // 5. Atualizar Empresa Parceira (US14)
        empDto.setNome("Livraria e Papelaria Universitária");
        EmpresaParceira empAtualizada = empresaService.atualizar(empSalva.getId(), empDto);
        assertEquals("Livraria e Papelaria Universitária", empAtualizada.getNome());

        // 6. Excluir Empresa Parceira (US14)
        empresaService.excluir(empSalva.getId());
        assertEquals(0, empresaService.listarTodas().size());
    }
}
