const BASE_URL = 'https://tcc-senai-tawny.vercel.app';
const endpoint = '/pedidos';
const contentContainer = document.getElementById('pedidos-content');

const getToken = () => localStorage.getItem('authToken');
const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`
});

document.addEventListener('DOMContentLoaded', () => {
    if (!getToken()) {
        window.location.href = 'login.html';
    }
    else {
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
                    <th>Usuário ID</th>
                    <th>Data Pedido</th>
                    <th>Valor</th>
                </tr>
            </thead>
            <tbody>
    `;

    records.forEach((record) => {
        tableHTML += `
            <tr>
                <td>${record.id}</td>
                <td>${record.id_usuario}</td>
                <td>${new Date(record.data_pedido).toLocaleDateString()}</td>
                <td>R$ ${record.valor.toFixed(2)}</td>
            </tr>
        `;
    });
    
    tableHTML += `
            </tbody>
        </table>
    `;
    contentContainer.innerHTML = tableHTML;
}


