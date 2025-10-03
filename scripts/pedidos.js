const BASE_URL = 'https://tcc-senai-tawny.vercel.app';
const endpoint = '/pedidos';
const contentContainer = document.getElementById('pedidos-content');

// O formulário de cadastro de pedidos é mais complexo e foi omitido. Foco no Read/Update/Delete.

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
            contentContainer.innerHTML = '<p>Erro ao carregar pedidos.</p>';
        }
    } catch (error) {
        contentContainer.innerHTML = '<p>Erro de rede ao carregar pedidos.</p>';
    }
}

function renderTable(records) {
    if (!contentContainer) return;
    
    if (records.length === 0) {
        contentContainer.innerHTML = '<p>Nenhum pedido encontrado.</p>';
        return;
    }

    let tableHTML = `
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>ID Cliente</th>
                    <th>Status</th>
                    <th>Total</th>
                    <th>Ações</th>
                </tr>
            </thead>
            <tbody>
    `;

    records.forEach(record => {
        tableHTML += `
            <tr data-id="${record.id}">
                <td data-label="ID:">${record.id}</td>
                <td data-label="ID Cliente:">${record.id_cliente}</td>
                <td data-label="Status:" contenteditable="true">${record.status}</td>
                <td data-label="Total:">${record.total}</td>
                <td>
                    <button onclick="alterar(${record.id}, this)">Alterar Status</button>
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
    // Apenas atualizando o status, que é o campo que geralmente o admin mudaria.
    const corpo = {
        status: row.cells[2].textContent,
    };

    try {
        const response = await fetch(`${BASE_URL}${endpoint}/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(corpo)
        });

        if (response.status === 202) {
            alert('Status do Pedido alterado com sucesso');
        } else {
            const errorData = await response.json();
            alert(`Erro ao alterar pedido: ${errorData.message}`);
        }
    } catch (error) {
        alert('Erro de rede ao alterar pedido.');
    }
}

window.excluir = async (id) => {
    if (!confirm(`Tem certeza que deseja excluir o Pedido ID: ${id}?`)) return;

    try {
        const response = await fetch(`${BASE_URL}${endpoint}/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });

        if (response.status === 204) {
            alert('Pedido excluído com sucesso!');
            window.location.reload();
        } else {
            const errorData = await response.json();
            alert(`Erro ao excluir pedido: ${errorData.message || response.statusText}`);
        }
    } catch (error) {
        alert('Erro de rede ao excluir pedido.');
    }
}