// Alterado para usar 'empresas-lista' que é o <tbody> da tabela
const tabelaEmpresasBody = document.getElementById('empresas-lista'); 
// Alterado para usar 'form-cadastro' que é o formulário em si
const formCadastro = document.getElementById('form-cadastro'); 
const btnCadastrar = document.getElementById('cadastro'); // Botão de submit do form

// --- Funções Auxiliares ---
const getToken = () => localStorage.getItem('authToken');
const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`
});

// --- 4. FUNÇÃO DE LISTAGEM (GET) ---
async function fetchRecords() {
    if (!tabelaEmpresasBody) {
        console.error("Elemento 'empresas-lista' não encontrado. Verifique seu HTML.");
        return;
    }
    
    // Limpa a tabela antes de popular (remove a linha "Carregando empresas...")
    tabelaEmpresasBody.innerHTML = ''; 

    try {
        const response = await fetch('https://tcc-senai-tawny.vercel.app/empresas', {
            method: 'GET',
            headers: getHeaders()
        });

        if (response.status === 401) {
            alert('Sessão expirada. Faça login novamente.');
            localStorage.removeItem('authToken');
            window.location.href = 'login.html';
            return;
        }

        const empresas = await response.json();

        empresas.forEach((empresa) => {
            const linha = document.createElement('tr');
            
            // LÓGICA DE LIMITAÇÃO DE CARACTERES
            const urlCompleta = empresa.img || '';
            const urlReduzida = urlCompleta.length > 10 
                ? urlCompleta.substring(0, 10) + '...'
                : urlCompleta;

            linha.innerHTML = `
                <td data-label="Id:">${empresa.id}</td>
                <td data-label="Nome:" contenteditable="true">${empresa.nome}</td>
                <td data-label="CNPJ:" contenteditable="true">${empresa.cnpj}</td>
                <td data-label="Email:" contenteditable="true">${empresa.email}</td>
                
                <td data-label="Imagem:" data-full-img="${urlCompleta}" contenteditable="true">${urlReduzida}</td>
                
                <td>
                    <button onclick="alterar(this)">*</button>
                    <button onclick="excluir(${empresa.id})">-</button>
                </td>
            `;
            // AGORA tabelaEmpresasBody É GARANTIDAMENTE O <tbody> CORRETO
            tabelaEmpresasBody.appendChild(linha); 
        });

    } catch (error) {
        console.error('Erro ao buscar empresas:', error);
        alert('Erro de conexão ao carregar a lista de empresas.');
    }
}

// --- 1. FUNÇÃO DE CADASTRO (POST) ---
formCadastro?.addEventListener('submit', async (event) => {
    event.preventDefault();

    const corpo = {
        nome: formCadastro.nome.value,
        cnpj: formCadastro.cnpj.value,
        email: formCadastro.email.value,
        img: formCadastro.img.value
    };

    try {
        const response = await fetch('https://tcc-senai-tawny.vercel.app/empresas', {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(corpo)
        });

        if (response.status === 201) {
            alert('Empresa cadastrada com sucesso!');
            window.location.reload();
        } else if (response.status === 401) {
             alert('Sessão expirada. Faça login novamente.');
             localStorage.removeItem('authToken');
             window.location.href = 'login.html';
        } else {
            const errorData = await response.json().catch(() => ({}));
            alert(`Erro ao cadastrar empresa: ${errorData.message || 'Erro desconhecido.'}`);
        }
    } catch (error) {
        alert('Erro de conexão ao tentar cadastrar a empresa.');
    }
});


// --- 2. FUNÇÃO DE ALTERAÇÃO (PUT) ---
async function alterar(e) {
    const linha = e.parentNode.parentNode;
    const id = linha.children[0].textContent;

    const imgCell = linha.children[4];
    const isShortened = imgCell.textContent.endsWith('...');
    const fullImgUrl = imgCell.getAttribute('data-full-img');
    
    const imgValue = isShortened ? fullImgUrl : imgCell.textContent;

    const corpo = {
        nome: linha.children[1].textContent,
        cnpj: linha.children[2].textContent,
        email: linha.children[3].textContent,
        img: imgValue 
    }

    try {
        const response = await fetch(`https://tcc-senai-tawny.vercel.app/empresas/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(corpo)
        });

        if (response.status === 202) {
            alert('Empresa alterada com sucesso');
            window.location.reload();
        } else if (response.status === 401) {
            alert('Sessão expirada. Faça login novamente.');
            localStorage.removeItem('authToken');
            window.location.href = 'login.html';
        } else {
            const errorData = await response.json().catch(() => ({}));
            alert(`Erro ao alterar empresa. Status: ${response.status}. Mensagem: ${errorData.message || 'Verifique se o CNPJ/E-mail já existe.'}`);
        }
    } catch (error) {
        alert('Erro de conexão ao tentar alterar a empresa.');
    }
}

// --- 3. FUNÇÃO DE EXCLUSÃO (DELETE) ---
async function excluir(id) {
    if (!confirm('Tem certeza que deseja excluir esta empresa?')) return;

    try {
        const response = await fetch(`https://tcc-senai-tawny.vercel.app/empresas/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });

        if (response.status === 204) {
            alert('Empresa excluída com sucesso');
            window.location.reload();
        } else if (response.status === 401) {
            alert('Sessão expirada. Faça login novamente.');
            localStorage.removeItem('authToken');
            window.location.href = 'login.html';
        } else {
            const errorData = await response.json().catch(() => ({}));
            alert(`Erro ao excluir empresa. Status: ${response.status}. Mensagem: ${errorData.message || 'Erro desconhecido.'}`);
        }
    } catch (error) {
        alert('Erro de conexão ao tentar excluir a empresa.');
    }
}

// --- Inicialização e Proteção de Rotas ---
document.addEventListener('DOMContentLoaded', () => {
    // Proteção de rota no frontend
    if (!getToken()) {
        window.location.href = 'login.html';
    } else {
        // Carrega os dados após a verificação do token
        fetchRecords();
    }
});

// --- Logout ---
document.getElementById('logout-btn')?.addEventListener('click', () => {
    localStorage.removeItem('authToken');
    window.location.href = 'login.html';
});