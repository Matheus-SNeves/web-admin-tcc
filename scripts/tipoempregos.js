const formCadastro = document.getElementById('form-cadastro'); 
const tabelaLista = document.getElementById('tipoempregos-lista');
const BASE_URL = 'https://tcc-senai-tawny.vercel.app/tipoempregos';

// --- Autenticação ---
const authToken = localStorage.getItem('authToken');

if (!authToken) {
    alert('Sessão expirada. Redirecionando para o login.');
    window.location.href = 'login.html'; 
}

const authHeader = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${authToken}`
};

// --- FUNÇÃO DE CADASTRO (POST) ---
formCadastro.addEventListener('submit', async (event) => {
    event.preventDefault();

    const corpo = {
        nome: formCadastro.nome.value,
        salario: parseFloat(formCadastro.salario.value),
        carga_horaria: parseInt(formCadastro.carga_horaria.value),
        descricao: formCadastro.descricao.value
    };

    try {
        const response = await fetch(BASE_URL, {
            method: 'POST',
            headers: authHeader,
            body: JSON.stringify(corpo)
        });

        if (response.status === 201) {
            alert('Tipo de Emprego cadastrado com sucesso!');
            window.location.reload();
        } else if (response.status === 401) {
            alert('Acesso negado. Token inválido/expirado.');
        } else {
            const errorData = await response.json();
            alert(`Erro ao cadastrar: ${errorData.message || 'Erro desconhecido.'}`);
        }
    } catch (error) {
        alert('Erro de conexão ao tentar cadastrar.');
    }
});

// --- FUNÇÃO DE LISTAGEM (GET) ---
async function carregarLista() {
    try {
        const response = await fetch(BASE_URL, { headers: { 'Authorization': `Bearer ${authToken}` } });

        if (response.status === 401) {
            alert('Acesso negado. Faça login novamente.');
            window.location.href = 'login.html';
            return;
        }

        const dados = await response.json();
        
        tabelaLista.querySelector('tbody').innerHTML = ''; 
        
        dados.forEach((item) => {
            const linha = document.createElement('tr');
            linha.innerHTML = `
                <td data-label="ID:">${item.id}</td>
                <td data-label="Nome:" contenteditable="true">${item.nome}</td>
                <td data-label="Salário:" contenteditable="true">${item.salario.toFixed(2)}</td>
                <td data-label="Carga Horária:" contenteditable="true">${item.carga_horaria}</td>
                <td data-label="Descrição:" contenteditable="true">${item.descricao}</td>
                <td>
                    <button onclick="alterar(this)">*</button>
                    <button onclick="excluir(${item.id})">-</button>
                </td>
            `;
            tabelaLista.querySelector('tbody').appendChild(linha);
        });

    } catch (error) {
        console.error('Erro ao buscar dados:', error);
        alert('Erro ao carregar a lista.');
    }
}

// --- FUNÇÃO DE ALTERAÇÃO (PUT) ---
window.alterar = async function(e) {
    const linha = e.parentNode.parentNode;
    const id = linha.children[0].textContent; 

    const corpo = {
        nome: linha.children[1].textContent,
        salario: parseFloat(linha.children[2].textContent),
        carga_horaria: parseInt(linha.children[3].textContent),
        descricao: linha.children[4].textContent 
    };

    if (isNaN(corpo.salario) || isNaN(corpo.carga_horaria)) {
        alert('Salário e Carga Horária devem ser números válidos.');
        return;
    }

    try {
        const response = await fetch(`${BASE_URL}/${id}`, {
            method: 'PUT',
            headers: authHeader,
            body: JSON.stringify(corpo)
        });

        if (response.status === 202) {
            alert('Registro alterado com sucesso');
            window.location.reload();
        } else if (response.status === 401) {
             alert('Acesso negado. Token inválido/expirado.');
        } else {
            const errorData = await response.json();
            alert(`Erro ao alterar: ${errorData.message || 'Erro desconhecido.'}`);
        }
    } catch (error) {
        alert('Erro de conexão ao tentar alterar.');
    }
}

// --- FUNÇÃO DE EXCLUSÃO (DELETE) ---
window.excluir = async function(id) {
    if (!confirm(`Tem certeza que deseja excluir o registro ID: ${id}?`)) {
        return;
    }
    
    try {
        const response = await fetch(`${BASE_URL}/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (response.status === 204) {
            alert('Registro excluído com sucesso');
            window.location.reload();
        } else if (response.status === 401) {
             alert('Acesso negado. Token inválido/expirado.');
        } else {
            const errorData = await response.json();
            alert(`Erro ao excluir: ${errorData.message || 'Erro desconhecido.'}`);
        }
    } catch (error) {
        alert('Erro de conexão ao tentar excluir.');
    }
}

// Inicia o carregamento
document.addEventListener('DOMContentLoaded', carregarLista);