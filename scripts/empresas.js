const cadastro = document.getElementById('cadastro');
cadastro.addEventListener('submit', (event) => {
    event.preventDefault();
    const corpo = {
        nome: cadastro.nome.value,
        cnpj: cadastro.cnpj.value,
        email: cadastro.email.value,
        img: cadastro.img.value
    }
    fetch('https://tcc-senai-nine.vercel.app/empresas', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(corpo)
    })
        .then(response => response.status)
        .then(status => {
            if (status === 201) {
                alert('empresa cadastrado com sucesso');
                window.location.reload();
            } else {
                alert('Erro ao cadastrar empresa');
            }
        });
});

fetch('https://tcc-senai-nine.vercel.app/empresas')
    .then(response => response.json())
    .then(empresas => {
        const tabela = document.getElementById('empresas');
        empresas.forEach((empresa) => {
            const linha = document.createElement('tr');
            linha.innerHTML = `
            <td data-label="Id:">${empresa.id_empresa}</td>
            <td data-label="Nome:" contenteditable="true">${empresa.nome}</td>
            <td data-label="CNPJ:" contenteditable="true">${empresa.cnpj}</td>
            <td data-label="Email:" contenteditable="true">${empresa.email}</td>
            <td data-label="Imagem:" contenteditable="true">${empresa.img}</td>
            <td><button onclick="alterar(this)">*</button><button onclick="excluir(${empresa.id_empresa})">-</button></td>
        `;
            tabela.appendChild(linha);
        });
    });

function alterar(e) {
    const id = e.parentNode.parentNode.children[0].textContent
    const corpo = {
        nome: e.parentNode.parentNode.children[1].textContent,
        cnpj: e.parentNode.parentNode.children[2].textContent,
        email: e.parentNode.parentNode.children[3].textContent,
        img: e.parentNode.children[4].textContent
    }
    fetch(`https://tcc-senai-nine.vercel.app/empresas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(corpo)
    })
        .then(response => response.status)
        .then(status => {
            if (status === 202) {
                alert('empresa alterado com sucesso');
                window.location.reload();
            } else {
                alert('Erro ao alterar empresa');
            }
        });
}

function excluir(id_empresa) {
    fetch(`https://tcc-senai-nine.vercel.app/empresas/${id_empresa}`, {
        method: 'DELETE'
    })
        .then(response => response.status)
        .then(status => {
            if (status === 204) {
                alert('empresa excluído com sucesso');
                window.location.reload();
            } else {
                alert('Erro ao excluir empresa');
            }
        });
}
