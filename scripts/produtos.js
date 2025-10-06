const BASE_URL = 'https://tcc-senai-tawny.vercel.app';
const endpoint = '/produtos';

// Elementos do DOM
const cadastroForm = document.getElementById('form-cadastro'); // ID no HTML é 'form-cadastro'
const contentContainer = document.getElementById('produtos-content');

// Funções Auxiliares
const getToken = () => localStorage.getItem('authToken');
const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`
});

// Inicialização: Verifica Autenticação e Carrega Dados
document.addEventListener('DOMContentLoaded', () => {
    if (!getToken()) {
        window.location.href = 'login.html';
    } else {
        fetchRecords();
    }
});

// Listener de Logout (seguro com encadeamento opcional)
document.getElementById('logout-btn')?.addEventListener('click', () => {
    localStorage.removeItem('authToken');
    window.location.href = 'login.html';
});

// Listener para Cadastro de Produto (POST)
cadastroForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    
    // Constrói o corpo da requisição com base nos campos do formulário
    const corpo = {
        nome: cadastroForm.nome.value,
        // Converte para float e int
        preco: parseFloat(cadastroForm.preco.value),
        quantidade: parseInt(cadastroForm.quantidade.value),
        descricao: cadastroForm.descricao.value,
        categoria: cadastroForm.categoria.value,
        id_supermercado: parseInt(cadastroForm.id_supermercado.value),
        img: cadastroForm.img.value || null // Permite que a imagem seja opcional
    };

    try {
        const response = await fetch(BASE_URL + endpoint, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(corpo)
        });

        if (response.status === 201) {
            alert('Produto cadastrado com sucesso!');
            window.location.reload();
        } else {
            const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
            alert(`Erro ao cadastrar produto: ${errorData.message}`);
        }
    } catch (error) {
        alert('Erro de rede ao cadastrar produto.');
    }
});

// Função para buscar e exibir os produtos (GET)
async function fetchRecords() {
    try {
        const response = await fetch(BASE_URL + endpoint, {
            method: 'GET',
            headers: getHeaders()
        });

        if (response.ok) {
            const records = await response.json();
            renderTable(records);
        } else if (response.status === 401) {
            alert('Sessão expirada. Faça login novamente.');
            window.location.href = 'login.html';
        } else {
            const errorMessage = `Erro ao carregar produtos. Status: ${response.status} (${response.statusText})`;
            console.error(errorMessage, await response.json().catch(() => ({})));
            contentContainer.innerHTML = `<p>${errorMessage}</p>`;
        }
    } catch (error) {
        contentContainer.innerHTML = '<p>Erro de rede ao carregar produtos.</p>';
        console.error("Erro de rede:", error);
    }
}

function renderTable(records) {
    if (!contentContainer) return;

    if (records.length === 0) {
        contentContainer.innerHTML = '<p>Nenhum produto cadastrado.</p>';
        return;
    }

    let tableHTML = `
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Nome</th>
                    <th>Preço</th>
                    <th>Estoque</th>
                    <th>Descrição</th>
                    <th>Categoria</th>
                    <th>Super. ID</th>
                    <th>Imagem</th>
                    <th>Ações</th>
                </tr>
            </thead>
            <tbody>
    `;

    records.forEach(record => {
        const precoFormatado = (record?.preco ?? 0).toFixed(2);
        const imgUrl = record?.img ?? '';

        tableHTML += `
            <tr data-id="${record.id}">
                <td data-label="ID:">${record.id}</td>
                <td data-label="Nome:" contenteditable="true">${record.nome}</td>
                <td data-label="Preço:" contenteditable="true">${precoFormatado}</td>
                <td data-label="Estoque:" contenteditable="true">${record.quantidade}</td>
                <td data-label="Descrição:" contenteditable="true">${record.descricao}</td>
                <td data-label="Categoria:" contenteditable="true">${record.categoria}</td>
                <td data-label="Super. ID:" contenteditable="true">${record.id_supermercado}</td>
                
                <td data-label="Imagem:" contenteditable="true">
                    ${imgUrl || ''}
                </td>
                
                <td>
                    <button onclick="alterarProduto(${record.id}, this)">Alterar</button>
                    <button onclick="excluirProduto(${record.id})">Excluir</button>
                </td>
            </tr>
        `;
    });

    tableHTML += `
            </tbody>
        </table>
    `;
    contentContainer.innerHTML = tableHTML;
}

// Função global para alterar um produto (PUT)
window.alterarProduto = async (id, button) => {
    const row = button.closest('tr');
    // Mapeia os dados das células editáveis
    const corpo = {
        nome: row.cells[1].textContent,
        preco: parseFloat(row.cells[2].textContent),
        quantidade: parseInt(row.cells[3].textContent),
        descricao: row.cells[4].textContent,
        categoria: row.cells[5].textContent,
        id_supermercado: parseInt(row.cells[6].textContent),
        // O campo 7 é o da imagem, aqui usamos o texto (URL)
        img: row.cells[7].textContent.trim() === 'N/A' ? null : row.cells[7].querySelector('img')?.src || row.cells[7].textContent
    };

    try {
        const response = await fetch(`${BASE_URL}${endpoint}/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(corpo)
        });

        if (response.status === 202 || response.ok) {
            alert('Produto alterado com sucesso');
            fetchRecords(); // Recarrega a tabela
        } else {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            alert(`Erro ao alterar produto: ${errorData.message}`);
        }
    } catch (error) {
        alert('Erro de rede ao alterar produto.');
    }
}

// Função global para excluir um produto (DELETE)
window.excluirProduto = async (id) => {
    if (!confirm(`Tem certeza que deseja excluir o produto ID: ${id}?`)) return;

    try {
        const response = await fetch(`${BASE_URL}${endpoint}/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });

        if (response.status === 204 || response.ok) {
            alert('Produto excluído com sucesso!');
            window.location.reload();
        } else {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            alert(`Erro ao excluir produto: ${errorData.message}`);
        }
    } catch (error) {
        alert('Erro de rede ao excluir produto.');
    }
}