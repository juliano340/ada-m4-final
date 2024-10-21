import './style.css'

// Array de tags globais
const tags = ['Frontend', 'Backend', 'Fullstack'];
let selectedUserId = null; // Variável para armazenar o usuário selecionado
let selectedTag = null; // Variável para armazenar a tag selecionada

// Array de cards (com status) em memória inicial
let cards = [
    { id: 1, title: 'Implementar página de login', userId: 1, tag: 'Frontend', status: 'Todo', createdAt: new Date('2023-01-01T10:00:00') },
    { id: 2, title: 'Configurar servidor', userId: 2, tag: 'Backend', status: 'In Progress', createdAt: new Date('2023-02-15T14:30:00') },
    { id: 3, title: 'Criar API para pagamentos', userId: 3, tag: 'Fullstack', status: 'Completed', createdAt: new Date('2023-03-10T09:45:00') },
    { id: 4, title: 'Design do dashboard', userId: 4, tag: 'Frontend', status: 'Todo', createdAt: new Date('2023-04-05T16:00:00') }
];

// Função para carregar os cards do localStorage ou salvar os cards iniciais
function loadCardsFromLocalStorage() {
    const storedCards = localStorage.getItem('cards');
    if (storedCards) {
        // Se houver cards no localStorage, carregá-los
        cards = JSON.parse(storedCards);
        // Converte as strings de data de volta para objetos Date
        cards.forEach(card => {
            if (typeof card.createdAt === 'string') {
                card.createdAt = new Date(card.createdAt);
            }
        });
    } else {
        // Se não houver, salvar os cards da memória inicial no localStorage
        localStorage.setItem('cards', JSON.stringify(cards));
    }
}

// Função para formatar a data
function formatDate(date) {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
        return '[Data inválida]'; // Valor padrão caso a data não seja válida
    }
    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Função para buscar os dados de usuários e salvar no localStorage
async function fetchUsers() {
    const url = 'https://gist.githubusercontent.com/juliano340/cb155b5de64d5b89ac705d594ef5b7f6/raw/f494a4ecee9d9484ff20c87e4be3b9c1825fc6fa/users';

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
    // Limpa os cards anteriores
    document.getElementById('todoColumn').innerHTML = '<h2>📝 To do</h2>';
    document.getElementById('inProgressColumn').innerHTML = '<h2> 🔄 In progres</h2>';
    document.getElementById('completedColumn').innerHTML = '<h2> ✅ Completed</h2>';

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
        
        // Estrutura do card com botão de editar título
        cardDiv.innerHTML = `
            <button class="delete-btn" onclick="deleteCard(${card.id})">🗑️</button>
            <h3 id="title-${card.id}">${card.title}</h3>
            <button class="editButton" onclick="editTitle(${card.id})">✏️</button>
            <p><strong>Usuário:</strong> ${user.name}</p>
            <p><strong>Tag:</strong> ${card.tag}</p>
            <p><strong>Criado em:</strong> ${formatDate(card.createdAt)}</p>
            <div class="card-buttons">
                ${card.status !== 'Todo' ? `<button onclick="moveCardLeft(${card.id})">⬅️</button>` : ''}
                ${card.status !== 'Completed' ? `<button onclick="moveCardRight(${card.id})">➡️</button>` : ''}
            </div>
        `;

        // Adiciona o card na coluna apropriada com base no status
        if (card.status === 'Todo') {
            document.getElementById('todoColumn').appendChild(cardDiv);
        } else if (card.status === 'In Progress') {
            document.getElementById('inProgressColumn').appendChild(cardDiv);
        } else if (card.status === 'Completed') {
            document.getElementById('completedColumn').appendChild(cardDiv);
        }
    });
}

// Função para editar o título do card
window.editTitle = function(cardId) {
    const card = cards.find(c => c.id === cardId); // Encontra o card pelo ID
    const titleElement = document.getElementById(`title-${cardId}`); // Seleciona o elemento de título

    // Troca o título por um campo de input para edição
    titleElement.innerHTML = `
        <input class="editInput" id="editTitle-${cardId}" type="text" value="${card.title}">
        <button class="editButtonSave" onclick="saveTitle(${cardId})">Salvar</button>
        <button class="editButtonCancel" onclick="cancelEditTitle(${cardId}, '${card.title}')">Cancelar</button>
    `;
}

// Função para salvar o novo título
window.saveTitle = function(cardId) {
    const card = cards.find(c => c.id === cardId); // Encontra o card pelo ID
    const newTitle = document.getElementById(`editTitle-${cardId}`).value; // Obtém o novo valor do título

    card.title = newTitle; // Atualiza o título no card
    localStorage.setItem('cards', JSON.stringify(cards)); // Atualiza o localStorage
    const users = JSON.parse(localStorage.getItem('users')); // Obtém os usuários do localStorage
    displayCards(users, selectedUserId, selectedTag); // Atualiza a exibição dos cards
    // Exibir mensagem de feedback
    showFeedback("Tarefa atualizada com sucesso!");
}

// Função para cancelar a edição e restaurar o título original
window.cancelEditTitle = function(cardId, originalTitle) {
    const titleElement = document.getElementById(`title-${cardId}`);
    titleElement.innerHTML = originalTitle; // Restaura o título original
}

// Função para mover o card para a esquerda
window.moveCardLeft = function(cardId) {
    const card = cards.find(c => c.id === cardId);
    if (card.status === 'In Progress') {
        card.status = 'Todo';
    } else if (card.status === 'Completed') {
        card.status = 'In Progress';
    }
    // Salva os cards atualizados no localStorage
    localStorage.setItem('cards', JSON.stringify(cards));
    const users = JSON.parse(localStorage.getItem('users')); // Obtém os usuários do localStorage
    displayCards(users, selectedUserId, selectedTag); // Atualiza a exibição dos cards
}

// Função para mover o card para a direita
window.moveCardRight = function(cardId) {
    const card = cards.find(c => c.id === cardId);
    if (card.status === 'Todo') {
        card.status = 'In Progress';
    } else if (card.status === 'In Progress') {
        card.status = 'Completed';
    }
    // Salva os cards atualizados no localStorage
    localStorage.setItem('cards', JSON.stringify(cards));
    const users = JSON.parse(localStorage.getItem('users')); // Obtém os usuários do localStorage
    displayCards(users, selectedUserId, selectedTag); // Atualiza a exibição dos cards
}

// Função para excluir o card
window.deleteCard = function(cardId) {
    cards = cards.filter(card => card.id !== cardId); // Remove o card com o ID correspondente
    // Salva os cards atualizados no localStorage
    localStorage.setItem('cards', JSON.stringify(cards));
    const users = JSON.parse(localStorage.getItem('users')); // Obtém os usuários do localStorage
    displayCards(users, selectedUserId, selectedTag); // Atualiza a exibição dos cards

    // Exibir mensagem de feedback
    showFeedback("Tarefa excluída com sucesso!");
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

// Chama a função para buscar os dados de usuários e carregar cards do localStorage
loadCardsFromLocalStorage();
fetchUsers();

// MODAL

// Função para abrir o modal
const modal = document.getElementById("taskModal");
const addTaskButton = document.getElementById("addTaskButton");
const closeModal = document.querySelector(".close");
const feedbackMessage = document.createElement('div'); // Div para o feedback

addTaskButton.onclick = function() {
  modal.style.display = "block";
  populateUserOptions();
  populateTagOptions();
}

closeModal.onclick = function() {
  modal.style.display = "none";
}

window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}

// Função para popular as opções de usuários no modal
function populateUserOptions() {
  const userSelect = document.getElementById("userSelect");
  userSelect.innerHTML = ''; // Limpa as opções anteriores
  const users = JSON.parse(localStorage.getItem('users')); // Obtém os usuários do localStorage

  users.forEach(user => {
    const option = document.createElement("option");
    option.value = user.id;
    option.textContent = user.name;
    userSelect.appendChild(option);
  });
}

// Função para popular as opções de tags no modal
function populateTagOptions() {
  const tagSelect = document.getElementById("tagSelect");
  tagSelect.innerHTML = ''; // Limpa as opções anteriores

  tags.forEach(tag => {
    const option = document.createElement("option");
    option.value = tag;
    option.textContent = tag;
    tagSelect.appendChild(option);
  });
}

// Lidar com o envio do formulário para adicionar nova tarefa
const addTaskForm = document.getElementById("addTaskForm");
addTaskForm.onsubmit = function(event) {
  event.preventDefault();

  const userId = document.getElementById("userSelect").value;
  const tag = document.getElementById("tagSelect").value;
  const description = document.getElementById("taskDescription").value;

  // Criar o novo card com status "Todo" e data de criação atual
  const newCard = {
    id: cards.length + 1, // Gera um novo ID incremental
    title: description,
    userId: parseInt(userId),
    tag: tag,
    status: "Todo",
    createdAt: new Date() // Data de criação atual
  };

  // Adiciona a nova tarefa ao array de cards
  cards.push(newCard);

  // Atualiza a exibição dos cards
  const users = JSON.parse(localStorage.getItem('users')); // Obtém os usuários do localStorage
  displayCards(users, selectedUserId, selectedTag);

  // Salva os cards no localStorage
  localStorage.setItem('cards', JSON.stringify(cards));

  // Limpar os campos do modal após salvar
  addTaskForm.reset(); 

  // Fechar o modal
  modal.style.display = "none";

  // Exibir mensagem de feedback
  showFeedback("Tarefa adicionada com sucesso!");
}

// Função para exibir o feedback
function showFeedback(message) {
  feedbackMessage.classList.add('feedback');
  feedbackMessage.textContent = message;
  document.body.appendChild(feedbackMessage);

  // Remove a mensagem de feedback após 3 segundos
  setTimeout(() => {
    feedbackMessage.remove();
  }, 3000);
}
