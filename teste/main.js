import './style.css'

// Array de tags globais
const tags = ['Frontend', 'Backend', 'Fullstack'];
let selectedUserId = null; // Variável para armazenar o usuário selecionado
let selectedTag = null; // Variável para armazenar a tag selecionada

// Função para buscar os dados de usuários e salvar no localStorage
async function fetchUsers() {
    const url = 'https://gist.githubusercontent.com/juliano340/cb155b5de64d5b89ac705d594ef5b7f6/raw/0edb521f8f40fe2a612ab0cf09d5c7f1610b8949/users';

    try {
        const response = await fetch(url); // Fazendo a requisição para a URL
        if (!response.ok) {
            throw new Error('Erro ao buscar os usuários');
        }

        const data = await response.json(); // Convertendo os dados para JSON
        const users = data.users; // Acessando a propriedade 'users'

        // Salvando os usuários no localStorage
        localStorage.setItem('users', JSON.stringify(users));

        console.log('Usuários salvos no localStorage!');
        displayUsers(users); // Passa os usuários para exibir na lista
        displayTags();  // Exibe as tags
        displayCards(users); // Passa os usuários para exibir nos cards
        addUserClickEvents(users); // Adiciona eventos de clique aos usuários
        addTagClickEvents(users); // Adiciona eventos de clique às tags
    } catch (error) {
        console.error('Erro:', error);
    }
}

// Função para exibir os usuários na lista
function displayUsers(users) {
    const userList = document.getElementById('userList'); // Elemento <ul> onde os usuários serão exibidos

    if (users && users.length > 0) {
        users.forEach(user => {
            const li = document.createElement('li'); // Cria um elemento <li> para cada usuário
            li.setAttribute('data-id', user.id); // Adiciona o atributo data-id com o id do usuário
            li.innerHTML = `
                <img src="${user.picture}" alt="${user.name}" style="width:50px;height:50px;border-radius:50%;"> 
                ${user.name}`;
            userList.appendChild(li); // Adiciona o <li> à lista principal <ul>
        });
    } else {
        const li = document.createElement('li');
        li.textContent = 'Nenhum usuário encontrado no localStorage.';
        userList.appendChild(li);
    }
}

// Função para exibir as tags na lista separada
function displayTags() {
    const tagList = document.getElementById('tagList'); // Elemento <ul> onde as tags serão exibidas

    tags.forEach(tag => {
        const li = document.createElement('li'); // Cria um elemento <li> para cada tag
        li.setAttribute('data-tag', tag); // Adiciona o atributo data-tag com o nome da tag
        li.textContent = tag; // Adiciona o nome da tag como conteúdo
        tagList.appendChild(li); // Adiciona o <li> à lista de tags
    });
}

// Função para exibir os cards das atividades no estilo Kanban
function displayCards(users, filteredUserId = null, filteredTag = null) {
    const cardContainer = document.getElementById('cardContainer'); // Container para os cards
    cardContainer.innerHTML = ''; // Limpa os cards anteriores

    // Exemplo de array de cards
    const cards = [
        { title: 'Implementar página de login', userId: 1, tag: 'Frontend' },
        { title: 'Configurar servidor', userId: 2, tag: 'Backend' },
        { title: 'Criar API para pagamentos', userId: 3, tag: 'Fullstack' },
        { title: 'Design do dashboard', userId: 4, tag: 'Frontend' }
    ];

    // Filtragem dos cards com base no usuário e na tag selecionados
    const filteredCards = cards.filter(card => {
        const matchUser = filteredUserId ? card.userId === filteredUserId : true;
        const matchTag = filteredTag ? card.tag === filteredTag : true;
        return matchUser && matchTag;
    });

    filteredCards.forEach(card => {
        const cardDiv = document.createElement('div'); // Cria o elemento do card
        cardDiv.classList.add('card'); // Adiciona uma classe CSS para o card

        // Encontra o usuário relacionado ao card
        const user = users.find(user => user.id === card.userId);
        
        // Estrutura do card
        cardDiv.innerHTML = `
            <h3>${card.title}</h3>
            <p><strong>Usuário:</strong> ${user.name}</p>
            <p><strong>Tag:</strong> ${card.tag}</p>
        `;

        cardContainer.appendChild(cardDiv); // Adiciona o card ao container
    });
}

// Função para adicionar eventos de clique aos usuários (com toggle de filtro)
function addUserClickEvents(users) {
    const userListItems = document.querySelectorAll('#userList li');

    userListItems.forEach(li => {
        li.addEventListener('click', function() {
            const userId = parseInt(this.getAttribute('data-id')); // Obtém o ID do usuário

            // Se o usuário clicado já estiver selecionado, desmarcá-lo (toggle)
            if (selectedUserId === userId) {
                selectedUserId = null; // Remove o filtro do usuário
                this.classList.remove('selected'); // Remove a classe 'selected'
            } else {
                selectedUserId = userId; // Define o usuário selecionado
                userListItems.forEach(item => item.classList.remove('selected')); // Remove a seleção de todos
                this.classList.add('selected'); // Marca o usuário atual como selecionado
            }

            displayCards(users, selectedUserId, selectedTag); // Filtra os cards pelo usuário selecionado
        });
    });
}

// Função para adicionar eventos de clique às tags (com toggle de filtro)
function addTagClickEvents(users) {
    const tagListItems = document.querySelectorAll('#tagList li');

    tagListItems.forEach(li => {
        li.addEventListener('click', function() {
            const tag = this.getAttribute('data-tag'); // Obtém o nome da tag

            // Se a tag clicada já estiver selecionada, desmarcá-la (toggle)
            if (selectedTag === tag) {
                selectedTag = null; // Remove o filtro da tag
                this.classList.remove('selected'); // Remove a classe 'selected'
            } else {
                selectedTag = tag; // Define a tag selecionada
                tagListItems.forEach(item => item.classList.remove('selected')); // Remove a seleção de todas as tags
                this.classList.add('selected'); // Marca a tag atual como selecionada
            }

            displayCards(users, selectedUserId, selectedTag); // Filtra os cards pela tag selecionada
        });
    });
}

// Chama a função para buscar os dados de usuários
fetchUsers();
