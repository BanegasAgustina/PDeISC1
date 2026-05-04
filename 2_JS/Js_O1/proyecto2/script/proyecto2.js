
const form = document.getElementById("formStock");
const stockList = document.getElementById("stockList");
const statusMsg = document.getElementById("statusMsg");
const itemCountBadge = document.getElementById("itemCount");
const emptyListMsg = document.getElementById("emptyList");
const scrollTopBtn = document.getElementById("scrollTopBtn");

let inventarioLocal = [];

// 1. CARGA INICIAL Y SCROLL
window.addEventListener("DOMContentLoaded", () => {
    fetchStock();
});

// Lógica del botón de scroll
window.onscroll = function() {
    if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
        scrollTopBtn.style.display = "flex";
    } else {
        scrollTopBtn.style.display = "none";
    }
};

scrollTopBtn.addEventListener("click", () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

async function fetchStock() {
    try {
        const res = await fetch("/api/stock");
        const data = await res.json();
        inventarioLocal = data;
        renderStock();
    } catch (error) {
        console.error("Error al cargar stock:", error);
    }
}

// 2. ENVÍO Y DEMOSTRACIÓN DE LOS 3 MÉTODOS DE LECTURA
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // 🔹 MÉTODO 1: document.getElementById (Para campos clave)
    const producto = document.getElementById("producto").value;
    const categoria = document.getElementById("categoria").value;
    const codigo = document.getElementById("codigo").value;

    // 🔹 MÉTODO 2: form.elements (Para campos de proveedores y fechas)
    const proveedor = form.elements["proveedor"].value;
    const fechaIngreso = form.elements["fechaIngreso"].value;

    // 🔹 MÉTODO 3: FormData (Para precios, cantidades, descripciones y método de guardado)
    const formData = new FormData(form);
    const precio = formData.get("precio");
    const cantidad = formData.get("cantidad");
    const descripcion = formData.get("descripcion");
    const metodoGuardado = formData.get("metodoGuardado");

    // VALIDACIÓN DINÁMICA
    if (!validarFormulario(producto, categoria, codigo, precio, cantidad, fechaIngreso)) {
        mostrarEstado("⚠️ Por favor, completa todos los campos obligatorios.", "danger");
        return;
    }

    const nuevoItem = { producto, categoria, codigo, precio, cantidad, proveedor, fechaIngreso, descripcion, metodoGuardado };

    // GUARDADO DINÁMICO (AJAX/Fetch)
    try {
        const res = await fetch("/api/stock", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(nuevoItem)
        });

        const data = await res.json();

        if (data.success) {
            mostrarEstado(`✅ Producto guardado usando ${data.metodoUsado}() correctamente.`, "success");
            form.reset();
            form.classList.remove("was-validated");
            fetchStock(); // Recargar lista
        } else {
            mostrarEstado(`❌ Error: ${data.error}`, "danger");
        }
    } catch (error) {
        mostrarEstado("❌ Error de conexión con el servidor.", "danger");
    }
});

// 3. VALIDACIÓN JS
function validarFormulario(p, cat, cod, pre, can, fec) {
    let esValido = true;
    
    // Validación de campos vacíos
    if (!p || !cat || !cod || !pre || !can || !fec) esValido = false;
    
    // Validación de valores numéricos
    if (parseFloat(pre) < 0 || parseInt(can) < 0) esValido = false;

    form.classList.add("was-validated");
    return esValido;
}

// 4. MOSTRAR MENSAJES DINÁMICOS
function mostrarEstado(mensaje, tipo) {
    statusMsg.innerHTML = `
        <div class="alert alert-${tipo} alert-dismissible fade show shadow-sm" role="alert">
            ${mensaje}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
    
    // Auto-ocultar después de 5 segundos
    setTimeout(() => {
        const alert = statusMsg.querySelector('.alert');
        if (alert) {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        }
    }, 5000);
}

// 5. RENDERIZADO DINÁMICO DEL LISTADO
function renderStock() {
    stockList.innerHTML = "";
    
    if (inventarioLocal.length === 0) {
        emptyListMsg.classList.remove("d-none");
        itemCountBadge.innerText = "0 Items";
        return;
    }

    emptyListMsg.classList.add("d-none");
    itemCountBadge.innerText = `${inventarioLocal.length} Items`;

    inventarioLocal.forEach(item => {
        const div = document.createElement("div");
        div.className = "list-group-item stock-item p-3 mb-2 bg-white rounded-3 shadow-sm";
        
        div.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <h6 class="fw-bold mb-1">${item.producto}</h6>
                    <small class="text-muted d-block mb-2">
                        <i class="fas fa-tag me-1"></i>${item.categoria} | 
                        <i class="fas fa-barcode me-1"></i>SKU: ${item.codigo}
                    </small>
                    <div class="d-flex gap-2">
                        <span class="badge bg-light text-dark border badge-stock">
                            <i class="fas fa-dollar-sign me-1"></i>${parseFloat(item.precio).toLocaleString()}
                        </span>
                        <span class="badge ${item.cantidad < 10 ? 'bg-danger' : 'bg-success'} badge-stock">
                            Stock: ${item.cantidad}
                        </span>
                    </div>
                </div>
                <div class="text-end">
                    <small class="text-muted d-block mb-2">${item.fechaIngreso}</small>
                    <button class="btn btn-sm btn-outline-primary border-0" onclick="alert('Proveedor: ${item.proveedor || 'No asignado'}')">
                        <i class="fas fa-info-circle"></i>
                    </button>
                </div>
            </div>
        `;
        stockList.prepend(div);
    });
}
