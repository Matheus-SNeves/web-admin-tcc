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
        contentContainer.innerHTML = '<p>Nenhuma avaliação cadastrada.</p>';
        return;
    }

    let tableHTML = `
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Usuário ID</th>
                    <th>Produto ID</th>
                    <th>Nota</th>
                    <th>Comentário</th>
                    <th>Img</th> <th>Ações</th>
                </tr>
            </thead>
            <tbody>
    `;

    records.forEach(record => {
        const id = record?.id ?? '';
        const id_usuario = record?.id_usuario ?? ''; 
        const id_produto = record?.id_produto ?? '';
        const nota = record?.nota ?? '';
        const comentario = record?.comentario ?? '';
        const img = record?.img ?? ''; // NOVO: Captura a URL da imagem

        tableHTML += `
            <tr data-id="${id}">
                <td data-label="ID:">${id}</td>
                <td data-label="Usuário ID:">${id_usuario}</td>
                <td data-label="Produto ID:">${id_produto}</td>
                <td data-label="Nota:">${nota}</td>
                <td data-label="Comentário:">${comentario}</td>
                <td data-label="Img:">
                    ${img ? `<img src="${img}" alt="Imagem" style="max-width: 50px; max-height: 50px;">` : 'N/A'}
                </td>
                <td>
                    <button onclick="excluirAvaliacao(${id})">Excluir</button>
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