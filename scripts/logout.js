

document.getElementById('logout-btn')?.addEventListener('click', () => {
    // 1. Remove o token de autenticação (JWT) armazenado
    localStorage.removeItem('authToken');
    
    // 2. Redireciona para a página de login
    window.location.href = 'login.html';
});