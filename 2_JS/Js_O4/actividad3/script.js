// URL de la API publica indicada en la consigna.
const API_URL = "https://jsonplaceholder.typicode.com/users?authuser=0";

// Elementos del DOM que se actualizan desde JavaScript.
const usersList = document.getElementById("usersList");
const statusBox = document.getElementById("status");
const searchInput = document.getElementById("search");

// Array donde se guardan todos los usuarios obtenidos de la API.
let users = [];

// Renderiza los usuarios recibidos en tarjetas.
function renderUsers(items) {
  // Si el filtro no encuentra coincidencias, muestra un mensaje.
  if (items.length === 0) {
    usersList.innerHTML = "";
    statusBox.className = "alert alert-warning status-box";
    statusBox.textContent = "No hay usuarios que coincidan con la busqueda.";
    return;
  }

  statusBox.className = "alert alert-success status-box";
  statusBox.textContent = `Mostrando ${items.length} usuario(s).`;
  usersList.innerHTML = items.map((user) => `
    <article class="col-sm-6 col-lg-4">
      <div class="user-card">
        <span class="badge text-bg-primary align-self-start">Usuario ${user.id}</span>
        <h2 class="h5 mb-0">${user.name}</h2>
        <a class="email-link" href="mailto:${user.email}">${user.email}</a>
      </div>
    </article>
  `).join("");
}

// Filtra el array local cada vez que el usuario escribe.
searchInput.addEventListener("input", () => {
  const term = searchInput.value.trim().toLowerCase();
  const filteredUsers = users.filter((user) => user.name.toLowerCase().includes(term));
  renderUsers(filteredUsers);
});

// Carga todos los usuarios una sola vez desde la API.
async function loadUsers() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    users = await response.json();
    searchInput.disabled = false;
    renderUsers(users);
  } catch (error) {
    statusBox.className = "alert alert-danger status-box";
    statusBox.textContent = `No se pudieron cargar los usuarios: ${error.message}`;
  }
}

// Ejecuta la carga inicial al abrir la pagina.
loadUsers();
