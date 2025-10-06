const BASE_URL = 'https://tcc-senai-tawny.vercel.app';
const endpoint = '/produtos';
const cadastroForm = document.getElementById('cadastro');
const contentContainer = document.getElementById('produtos-content');

const getToken = () => localStorage.getItem('authToken');
const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`
});

document.addEventListener('DOMContentLoaded', () => {
    if (!getToken()) {
        window.location.href = 'login.html';
    } else {
        fetchRecords();
    }
});

document.getElementById('logout-btn')?.addEventListener('click', () => {
    localStorage.removeItem('authToken');
    window.location.href = 'login.html';
});

cadastroForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const corpo = {
        nome: cadastroForm.nome.value,
        preco: parseFloat(cadastroForm.preco.value),
        quantidade: parseInt(cadastroForm.quantidade.value),
        descricao: cadastroForm.descricao.value,
        categoria: cadastroForm.categoria.value,
        id_supermercado: parseInt(cadastroForm.id_supermercado.value),
        img: cadastroForm.img.value
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
            const errorData = await response.json();
            alert(`Erro ao cadastrar produto: ${errorData.message}`);
        }
    } catch (error) {
        alert('Erro de rede ao cadastrar produto.');
    }
});

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
            contentContainer.innerHTML = '<p>Erro ao carregar produtos.</p>';
        }
    } catch (error) {
        contentContainer.innerHTML = '<p>Erro de rede ao carregar produtos.</p>';
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
                    <th>Qtd</th>
                    <th>Descrição</th>
                    <th>Categoria</th>
                    <th>ID Supermercado</th>
                    <th>Img</th>
                    <th>Ações</th>
                </tr>
            </thead>
            <tbody>
    `;

    records.forEach(record => {
        const urlCompleta = record.img || '';
        const urlReduzida = urlCompleta.length > 10
            ? urlCompleta.substring(0, 10) + '...'
            : urlCompleta;

        tableHTML += `
            <tr data-id="${record.id}">
                <td data-label="ID:">${record.id}</td>
                <td data-label="Nome:" contenteditable="true">${record.nome}</td>
                <td data-label="Preço:" contenteditable="true">${record.preco}</td>
                <td data-label="Qtd:" contenteditable="true">${record.quantidade}</td>
                <td data-label="Descrição:" contenteditable="true">${record.descricao}</td>
                <td data-label="Categoria:" contenteditable="true">${record.categoria}</td>
                <td data-label="ID Supermercado:" contenteditable="true">${record.id_supermercado}</td>
                <td data-label="Imagem:" contenteditable="true">${urlReduzida}</td> 
                <td>
                    <button onclick="alterar(${record.id}, this)">Alterar</button>
                    <button onclick="excluir(${record.id})">Excluir</button>
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

window.alterar = async (id, button) => {
    const row = button.closest('tr');
    const corpo = {
        nome: row.cells[1].textContent,
        preco: parseFloat(row.cells[2].textContent),
        quantidade: parseInt(row.cells[3].textContent),
        descricao: row.cells[4].textContent,
        categoria: row.cells[5].textContent,
        id_supermercado: parseInt(row.cells[6].textContent),
        img: row.cells[7].textContent,
    };

    try {
        const response = await fetch(`${BASE_URL}${endpoint}/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(corpo)
        });

        if (response.status === 202) {
            alert('Produto alterado com sucesso');
            window.location.reload();
        } else {
            const errorData = await response.json();
            alert(`Erro ao alterar produto: ${errorData.message}`);
        }
    } catch (error) {
        alert('Erro de rede ao alterar produto.');
    }
}

window.excluir = async (id) => {
    if (!confirm(`Tem certeza que deseja excluir o produto ID: ${id}?`)) return;

    try {
        const response = await fetch(`${BASE_URL}${endpoint}/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });

        if (response.status === 204) {
            alert('Produto excluído com sucesso!');
            window.location.reload();
        } else {
            const errorData = await response.json();
            alert(`Erro ao excluir produto: ${errorData.message || response.statusText}`);
        }
    } catch (error) {
        alert('Erro de rede ao excluir produto.');
    }
}