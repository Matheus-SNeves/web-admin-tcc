const BASE_URL = 'https://tcc-senai-tawny.vercel.app';
const endpoint = '/avaliacoes';
const contentContainer = document.getElementById('avaliacoes-content');

// O formulário de cadastro de avaliações é geralmente feito pelo cliente e foi omitido aqui.

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
            contentContainer.innerHTML = '<p>Erro ao carregar avaliações.</p>';
        }
    } catch (error) {
        contentContainer.innerHTML = '<p>Erro de rede ao carregar avaliações.</p>';
    }
}

function renderTable(records) {
    if (!contentContainer) return;
    
    if (records.length === 0) {
        contentContainer.innerHTML = '<p>Nenhuma avaliação encontrada.</p>';
        return;
    }

    let tableHTML = `
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>ID Usuário</th>
                    <th>ID Produto</th>
                    <th>Nota</th>
                    <th>Comentário</th>
                    <th>Ações</th>
                </tr>
            </thead>
            <tbody>
    `;

    records.forEach(record => {
        tableHTML += `
            <tr data-id="${record.id}">
                <td data-label="ID:">${record.id}</td>
                <td data-label="ID Usuário:">${record.id_usuario}</td>
                <td data-label="ID Produto:">${record.id_produto}</td>
                <td data-label="Nota:" contenteditable="true">${record.nota}</td>
                <td data-label="Comentário:" contenteditable="true">${record.comentario}</td>
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
        nota: parseFloat(row.cells[3].textContent),
        comentario: row.cells[4].textContent,
    };

    try {
        const response = await fetch(`${BASE_URL}${endpoint}/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(corpo)
        });

        if (response.status === 202) {
            alert('Avaliação alterada com sucesso');
        } else {
            const errorData = await response.json();
            alert(`Erro ao alterar avaliação: ${errorData.message}`);
        }
    } catch (error) {
        alert('Erro de rede ao alterar avaliação.');
    }
}

window.excluir = async (id) => {
    if (!confirm(`Tem certeza que deseja excluir a avaliação ID: ${id}?`)) return;

    try {
        const response = await fetch(`${BASE_URL}${endpoint}/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });

        if (response.status === 204) {
            alert('Avaliação excluída com sucesso!');
            window.location.reload();
        } else {
            const errorData = await response.json();
            alert(`Erro ao excluir avaliação: ${errorData.message || response.statusText}`);
        }
    } catch (error) {
        alert('Erro de rede ao excluir avaliação.');
    }
}