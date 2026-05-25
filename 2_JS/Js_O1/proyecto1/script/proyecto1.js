
const form = document.getElementById("formReserva");
const lista = document.getElementById("lista");
const mensajeContainer = document.getElementById("mensaje");
const contador = document.getElementById("contador");
const emptyState = document.getElementById("empty-state");
const scrollTopBtn = document.getElementById("scrollTopBtn");

// Elementos Multi-paso
const step1 = document.getElementById("step-1");
const step2 = document.getElementById("step-2");
const btnNext = document.getElementById("next-step");
const btnPrev = document.getElementById("prev-step");
const progress = document.getElementById("form-progress");

// Elementos de control
const checkinInput = document.getElementById("checkin");
const checkoutInput = document.getElementById("checkout");
const nochesInput = document.getElementById("noches");
const nochesDisplay = document.getElementById("noches-display");
const infoNoches = document.getElementById("info-noches");
const nombreInput = document.getElementById("nombre");

let totalReservas = 0;

// 1. NAVEGACIÓN MULTI-PASO
btnNext.addEventListener("click", () => {
  const nombre = document.getElementById("nombre").value;
  const email = document.getElementById("email").value;
  const telefono = document.getElementById("telefono").value;

  if (validarPaso1(nombre, email, telefono)) {
    step1.classList.add("d-none");
    step2.classList.remove("d-none");
    progress.style.width = "100%";
  }
});

btnPrev.addEventListener("click", () => {
  step2.classList.add("d-none");
  step1.classList.remove("d-none");
  progress.style.width = "50%";
});

function validarPaso1(n, e, t) {
  if (
    n.trim().length < 3 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) ||
    t.trim().length < 6
  ) {
    mostrarNotificacion(
      "⚠️ Por favor completa tus datos personales correctamente.",
      "warning",
    );
    return false;
  }
  return true;
}

// 2. CARGA INICIAL Y CONFIGURACIÓN
window.addEventListener("DOMContentLoaded", async () => {
  const hoy = new Date().toISOString().split("T")[0];
  checkinInput.min = hoy;
  cargarReservas();
});

// Lógica del botón de scroll
window.onscroll = function () {
  if (
    document.body.scrollTop > 100 ||
    document.documentElement.scrollTop > 100
  ) {
    scrollTopBtn.style.display = "flex";
  } else {
    scrollTopBtn.style.display = "none";
  }
};

scrollTopBtn.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
});

async function cargarReservas() {
  try {
    const res = await fetch("/api/reservas");
    const data = await res.json();
    lista.innerHTML = "";
    totalReservas = 0;

    if (data.length === 0) {
      emptyState.classList.remove("d-none");
    } else {
      emptyState.classList.add("d-none");
      data.forEach((r) => agregarReservaAlDOM(r));
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

// 3. VALIDACIONES Y CÁLCULOS
nombreInput.addEventListener("input", (e) => {
  e.target.value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");
});

const actualizarFechas = () => {
  const checkin = new Date(checkinInput.value);
  const checkout = new Date(checkoutInput.value);

  if (checkinInput.value) checkoutInput.min = checkinInput.value;

  if (checkinInput.value && checkoutInput.value && checkout > checkin) {
    const noches = Math.ceil((checkout - checkin) / (1000 * 60 * 60 * 24));
    nochesInput.value = noches;
    nochesDisplay.innerText = `${noches} ${noches === 1 ? "noche" : "noches"}`;
    infoNoches.classList.remove("d-none");
  } else {
    infoNoches.classList.add("d-none");
    nochesInput.value = 0;
  }
};

checkinInput.addEventListener("change", actualizarFechas);
checkoutInput.addEventListener("change", actualizarFechas);

// 4. ENVÍO (DEMOSTRACIÓN DE LOS 3 MÉTODOS DE LECTURA DE FORMULARIOS)
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  console.log("--- INICIANDO LECTURA DE DATOS (3 MÉTODOS) ---");

  // MÉTODO 1: Acceso Directo por ID (document.getElementById)
  // Se utiliza para campos específicos que tienen un ID único.
  const nombre = document.getElementById("nombre").value;
  const email = document.getElementById("email").value;
  console.log("Método 1 (ID) -> Nombre:", nombre, "| Email:", email);

  // MÉTODO 2: Colección 'elements' del Formulario (Acceso por propiedad name)
  // Se utiliza para acceder a los campos a través del objeto del formulario.
  const telefono = form.elements["telefono"].value;
  const habitacion = form.elements["habitacion"].value;
  console.log("Método 2 (Elements) -> Tel:", telefono, "| Hab:", habitacion);

  // MÉTODO 3: API 'FormData' (Objeto moderno y escalable)
  // Ideal para procesar todos los campos de forma masiva o enviar archivos.
  const formData = new FormData(form);
  const huespedes = formData.get("huespedes");
  const checkin = formData.get("checkin");
  const checkout = formData.get("checkout");
  const noches = formData.get("noches");
  console.log(
    "Método 3 (FormData) -> Huéspedes:",
    huespedes,
    "| Noches:",
    noches,
  );

  console.log("--- FIN DE LECTURA DE DATOS ---");

  if (!habitacion || !checkin || !checkout || noches <= 0) {
    mostrarNotificacion("⚠️ Completa los detalles de tu estadía.", "warning");
    return;
  }

  const reserva = {
    nombre,
    email,
    telefono,
    habitacion,
    huespedes,
    checkin,
    checkout,
    noches,
  };

  try {
    const res = await fetch("/api/reservas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reserva),
    });

    if (res.ok) {
      const nueva = await res.json();
      agregarReservaAlDOM(nueva, true);

      // Reset formulario y volver al paso 1
      form.reset();
      step2.classList.add("d-none");
      step1.classList.remove("d-none");
      progress.style.width = "50%";
      infoNoches.classList.add("d-none");

      mostrarNotificacion("🛎️ ¡Reserva realizada con éxito!", "success");
      emptyState.classList.add("d-none");
    }
  } catch (error) {
    mostrarNotificacion("❌ Error de servidor", "danger");
  }
});

function agregarReservaAlDOM(r, esNueva = false) {
  const li = document.createElement("li");
  li.className = `list-group-item p-3 ${esNueva ? "new-item" : ""}`;

  li.innerHTML = `
        <div class="d-flex justify-content-between align-items-start">
            <div>
                <h6 class="mb-1 fw-bold text-dark">${r.nombre}</h6>
                <div class="small text-muted mb-1">
                    <i class="fas fa-envelope me-1"></i>${r.email}
                </div>
                <div class="badge bg-outline-primary text-primary border border-primary fw-normal">
                    ${r.habitacion} - ${r.huespedes} pers.
                </div>
            </div>
            <div class="text-end">
                <span class="badge bg-dark rounded-pill">${r.noches} noches</span>
                <div class="small text-muted mt-2">
                    ${r.checkin} al ${r.checkout}
                </div>
            </div>
        </div>
    `;

  lista.prepend(li);
  totalReservas++;
  contador.innerText = `${totalReservas} Reservas`;
}

function mostrarNotificacion(texto, tipo) {
  mensajeContainer.innerHTML = `
        <div class="alert alert-${tipo} alert-dismissible fade show shadow-sm" role="alert">
            ${texto}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
  setTimeout(() => {
    const alert = mensajeContainer.querySelector(".alert");
    if (alert) new bootstrap.Alert(alert).close();
  }, 4000);
}
