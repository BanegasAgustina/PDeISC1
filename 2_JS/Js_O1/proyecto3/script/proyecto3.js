

const form = document.getElementById("formPersona");
const listaPersonas = document.getElementById("listaPersonas");
const statusMsg = document.getElementById("statusMsg");
const emptyMsg = document.getElementById("emptyMsg");
const tieneHijosCheck = document.getElementById("tieneHijos");
const contenedorCantHijos = document.getElementById("contenedorCantHijos");
const btnLimpiar = document.getElementById("limpiarDB");
const scrollTopBtn = document.getElementById("scrollTopBtn");

// Inputs
const nombreInput = document.getElementById("nombre");
const apellidoInput = document.getElementById("apellido");
const nacionalidadInput = document.getElementById("nacionalidad");
const dniInput = document.getElementById("dni");
const telefonoInput = document.getElementById("telefono");

// 1. CARGA INICIAL
window.addEventListener("DOMContentLoaded", () => {
    renderLista();
});


// RESTRICCIONES


// Solo letras
const soloLetras = (e) => {
    e.target.value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");
};


const soloNumeros = (e) => {
    e.target.value = e.target.value.replace(/\D/g, "");
};

// DNI (máx 8)
const soloNumerosDNI = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 8) value = value.slice(0, 8);
    e.target.value = value;
};

// Eventos
nombreInput.addEventListener("input", soloLetras);
apellidoInput.addEventListener("input", soloLetras);
nacionalidadInput.addEventListener("input", soloLetras);
dniInput.addEventListener("input", soloNumerosDNI);
telefonoInput.addEventListener("input", soloNumeros);

// Hijos toggle
tieneHijosCheck.addEventListener("change", (e) => {
    contenedorCantHijos.classList.toggle("d-none", !e.target.checked);
});


// SUBMIT

form.addEventListener("submit", (e) => {
    e.preventDefault();

    // 1️getElementById
    const nombre = document.getElementById("nombre").value;
    const apellido = document.getElementById("apellido").value;
    const dni = document.getElementById("dni").value;

    // elements
    const email = form.elements["email"].value;
    const telefono = form.elements["telefono"].value;
    const nacionalidad = form.elements["nacionalidad"].value;

    //  FormData
    const formData = new FormData(form);
    const edad = formData.get("edad");
    const fechaNac = formData.get("fechaNac");
    const sexo = formData.get("sexo");
    const estadoCivil = formData.get("estadoCivil");
    const tieneHijos = formData.get("tieneHijos") === "on";
    const cantHijos = tieneHijos ? formData.get("cantHijos") : 0;

    if (!validarFormulario(nombre, apellido, edad, email, dni, telefono, nacionalidad, sexo, fechaNac, estadoCivil)) {
        return;
    }

    const nuevaPersona = {
        id: Date.now(),
        nombre,
        apellido,
        edad,
        fechaNac,
        sexo,
        dni,
        estadoCivil,
        nacionalidad,
        telefono,
        email,
        hijos: tieneHijos ? cantHijos : 0
    };

    guardarPersona(nuevaPersona);
});


//LOCALSTORAGE

function guardarPersona(persona) {
    try {
        let db = JSON.parse(localStorage.getItem("people_db")) || [];

        if (db.some(p => p.dni === persona.dni)) {
            mostrarMensaje(`❌ El DNI ${persona.dni} ya existe`, "danger");
            return;
        }

        db.push(persona);
        localStorage.setItem("people_db", JSON.stringify(db));

        mostrarMensaje("✅ Guardado correctamente", "success");

        form.reset();
        contenedorCantHijos.classList.add("d-none");

        renderLista();
    } catch {
        mostrarMensaje("❌ Error al guardar", "danger");
    }
}


//  RENDER

function renderLista() {
    const db = JSON.parse(localStorage.getItem("people_db")) || [];
    listaPersonas.innerHTML = "";

    if (db.length === 0) {
        emptyMsg.classList.remove("d-none");
        return;
    }

    emptyMsg.classList.add("d-none");

    db.forEach(p => {
        const div = document.createElement("div");
        div.className = "col";

        div.innerHTML = `
            <div class="person-card shadow-sm p-3">
                <h6>${p.nombre} ${p.apellido}</h6>
                <small>DNI: ${p.dni}</small><br>
                <small>${p.email}</small><br>
                <small>${p.edad} años - Hijos: ${p.hijos}</small>
            </div>
        `;

        listaPersonas.prepend(div);
    });
}


// VALIDACIÓN

function validarFormulario(nom, ape, ed, em, d, tel, nac, sex, fec, est) {
    if (!nom || !ape || !ed || !em || !d || !tel || !nac || !sex || !fec || !est) {
        mostrarMensaje("⚠️ Completar todos los campos", "warning");
        return false;
    }
    return true;
}


// MENSAJES

function mostrarMensaje(txt, tipo) {
    statusMsg.innerHTML = `
        <div class="alert alert-${tipo}">
            ${txt}
        </div>
    `;
}

//limpiar DB
btnLimpiar.addEventListener("click", () => {
    if (confirm("¿Seguro?")) {
        localStorage.removeItem("people_db");
        renderLista();
    }
});

//scroll
window.onscroll = () => {
    scrollTopBtn.style.display =
        document.documentElement.scrollTop > 100 ? "flex" : "none";
};

scrollTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
});