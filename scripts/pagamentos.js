const BASE_URL = 'https://tcc-senai-tawny.vercel.app';
const endpoint = '/pagamentos';
const contentContainer = document.getElementById('pagamentos-content');

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
            contentContainer.innerHTML = '<p>Erro ao carregar pagamentos.</p>';
        }
    } catch (error) {
        contentContainer.innerHTML = '<p>Erro de rede ao carregar pagamentos.</p>';
    }
}

function renderTable(records) {
    if (!contentContainer) return;
    if (records.length === 0) {
        contentContainer.innerHTML = '<p>Nenhum pagamento encontrado.</p>';
        return;
    }
    let tableHTML = `
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Pedido ID</th>
                    <th>Tipo</th>
                    <th>Data</th>
                    </tr>
            </thead>
            <tbody>
    `;
    records.forEach(record => {
        tableHTML += `
            <tr>
                <td>${record.id}</td>
                <td>${record.id_pedido}</td>
                <td>${record.tipo}</td>
                <td>${new Date(record.data_pagamento).toLocaleDateString()}</td>
            </tr>
        `;
    }

    );
    tableHTML += `
            </tbody>
        </table>
    `;
    contentContainer.innerHTML = tableHTML;
}
