const nomeInput = document.getElementById('nome');
const cpfInput = document.getElementById('cpf');
const telefoneInput = document.getElementById('telefone'); // Adicionado
const emailInput = document.getElementById('email');       // Corrigido para 'email'
const senhaInput = document.getElementById('senha');
const idEmpresaInput = document.getElementById('id_empresa');
const idTipoEmpregadoInput = document.getElementById('id_tipo_empregado');
const btnCadastrar = document.getElementById('cadastro'); // Corrigido para ID 'cadastro'
const displayErro = document.querySelector('.display');

btnCadastrar.addEventListener('click', async (event) => {
    event.preventDefault();

    const nome = nomeInput.value;
    const cpf = cpfInput.value;
    const telefone = telefoneInput.value; // Valor do telefone
    const email = emailInput.value;
    const senha = senhaInput.value;
    const id_empresa = parseInt(idEmpresaInput.value);
    const id_tipo_empregado = parseInt(idTipoEmpregadoInput.value);

    if (!nome || !cpf || !telefone || !email || !senha || isNaN(id_empresa) || isNaN(id_tipo_empregado)) {
        exibirErro('Preencha todos os campos corretamente (IDs de empresa e cargo devem ser números).');
        return;
    }

    try {
        const response = await fetch('https://tcc-senai-tawny.vercel.app/cadastro-adm', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nome, cpf, telefone, email, senha, id_empresa, id_tipo_empregado }) 
        });

        if (response.ok) {
            const data = await response.json();
            alert(`Usuário ${data.nome} cadastrado com sucesso!`);
            window.location.href = 'login.html';

        } else {
            const errorData = await response.json();
            exibirErro(errorData.message || 'ERRO: Falha ao cadastrar. Verifique os dados.');
        }

    } catch (error) {
        exibirErro('ERRO: Não foi possível conectar ao servidor para realizar o cadastro.');
    }
});

function exibirErro(mensagem) {
    if (displayErro) {
        displayErro.textContent = mensagem;
        displayErro.style.color = 'red';
    }
}