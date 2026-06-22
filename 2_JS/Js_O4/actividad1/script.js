// URL de la API publica indicada en la consigna.
const API_URL = "https://jsonplaceholder.typicode.com/users?authuser=0";

// Referencias a los elementos HTML que se van a modificar.
const usersList = document.getElementById("usersList");
const statusBox = document.getElementById("status");
const fetchBtn = document.getElementById("fetchBtn");
const axiosBtn = document.getElementById("axiosBtn");

// Muestra un mensaje de carga y limpia resultados anteriores.
function setLoading(method) {
  statusBox.className = "alert alert-warning status-box";
  statusBox.textContent = `Cargando usuarios con ${method}...`;
  usersList.innerHTML = "";
}

// Recibe un array de usuarios y lo dibuja en tarjetas Bootstrap.
function renderUsers(users, method) {
  statusBox.className = "alert alert-success status-box";
  statusBox.textContent = `${users.length} usuarios cargados con ${method}.`;
  usersList.innerHTML = users.map((user) => `
    <article class="col-sm-6 col-lg-4">
      <div class="user-card">
        <span class="badge text-bg-primary align-self-start">Usuario ${user.id}</span>
        <h2 class="h5 mb-0">${user.name}</h2>
        <a class="email-link" href="mailto:${user.email}">${user.email}</a>
      </div>
    </article>
  `).join("");
}

// Muestra errores de red o de API en pantalla.
function showError(error) {
  statusBox.className = "alert alert-danger status-box";
  statusBox.textContent = `No se pudieron cargar los datos: ${error.message}`;
}

// Obtiene los usuarios usando fetch.
fetchBtn.addEventListener("click", async () => {
  setLoading("fetch");

  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const users = await response.json();
    renderUsers(users, "fetch");
  } catch (error) {
    showError(error);
  }
});

// Obtiene los usuarios usando axios.
axiosBtn.addEventListener("click", async () => {
  setLoading("axios");

  try {
    const response = await axios.get(API_URL);
    renderUsers(response.data, "axios");
  } catch (error) {
    showError(error);
  }
});
