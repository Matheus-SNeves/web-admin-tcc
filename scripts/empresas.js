const btnCadastrar = document.getElementById('cadastro'); 
const tabelaEmpresas = document.getElementById('empresas');

// --- 1. FUNÇÃO DE CADASTRO (POST) ---
btnCadastrar.addEventListener('click', async (event) => {
    event.preventDefault();
    
    // Acesso direto aos valores dos inputs usando IDs
    const nome = document.getElementById('nome').value;
    const cnpj = document.getElementById('cnpj').value;
    const email = document.getElementById('email').value;
    const img = document.getElementById('img').value;

    const corpo = { nome, cnpj, email, img };
    
    try {
        const response = await fetch('https://tcc-senai-tawny.vercel.app/empresas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(corpo)
        });

        if (response.status === 201) {
            alert('Empresa cadastrada com sucesso!');
            window.location.reload();
        } else {
            const errorData = await response.json();
            alert(`Erro ao cadastrar empresa: ${errorData.message || 'Erro desconhecido.'}`);
        }
    } catch (error) {
        alert('Erro de conexão ao tentar cadastrar a empresa.');
    }
});

// --- 2. FUNÇÃO DE LISTAGEM (GET) ---
fetch('https://tcc-senai-tawny.vercel.app/empresas')
    .then(response => response.json())
    .then(empresas => {
        // Garantir que a tabela existe com o ID 'empresas' no HTML
        if (!tabelaEmpresas) return; 
        
        empresas.forEach((empresa) => {
            const linha = document.createElement('tr');
            linha.innerHTML = `
                <td data-label="Id:">${empresa.id}</td>
                <td data-label="Nome:" contenteditable="true">${empresa.nome}</td>
                <td data-label="CNPJ:" contenteditable="true">${empresa.cnpj}</td>
                <td data-label="Email:" contenteditable="true">${empresa.email}</td>
                <td data-label="Imagem:" contenteditable="true">${empresa.img || ''}</td>
                <td>
                    <button onclick="alterar(this)">*</button>
                    <button onclick="excluir(${empresa.id})">-</button>
                </td>
            `;
            tabelaEmpresas.appendChild(linha);
        });
    })
    .catch(error => {
        console.error('Erro ao buscar empresas:', error);
        alert('Erro ao carregar a lista de empresas.');
    });

// --- 3. FUNÇÃO DE ALTERAÇÃO (PUT) ---
function alterar(e) {
    const linha = e.parentNode.parentNode;
    const id = linha.children[0].textContent; 

    // O acesso aos campos está correto agora, usando a variável 'linha'
    const corpo = {
        nome: linha.children[1].textContent,
        cnpj: linha.children[2].textContent,
        email: linha.children[3].textContent,
        img: linha.children[4].textContent // CORRIGIDO
    }
    
    fetch(`https://tcc-senai-tawny.vercel.app/empresas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(corpo)
    })
        .then(response => response.status)
        .then(status => {
            if (status === 202) {
                alert('Empresa alterada com sucesso');
                window.location.reload();
            } else {
                alert('Erro ao alterar empresa. Código de Status: ' + status);
            }
        })
        .catch(() => alert('Erro de conexão ao tentar alterar a empresa.'));
}

function excluir(id) {
    fetch(`https://tcc-senai-tawny.vercel.app/empresas/${id}`, {
        method: 'DELETE'
    })
        .then(response => response.status)
        .then(status => {
            if (status === 204) {
                alert('Empresa excluída com sucesso');
                window.location.reload();
            } else {
                alert('Erro ao excluir empresa. Código de Status: ' + status);
            }
        })
        .catch(() => alert('Erro de conexão ao tentar excluir a empresa.'));
}