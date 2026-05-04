document.getElementById('registration-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const formData = new FormData(this);
    const resultContent = document.getElementById('result-content');
    const resultContainer = document.getElementById('result-container');
    const noResult = document.getElementById('no-result');

    let html = '';
    
    // Mapeo de nombres de campos para mostrar etiquetas bonitas
    const labels = {
        fullName: 'Nombre Completo',
        email: 'Correo Electrónico',
        age: 'Edad',
        gender: 'Género',
        country: 'País',
        newsletter: 'Suscripción'
    };

    // Procesar datos
    for (let [key, value] of formData.entries()) {
        html += `
            <div class="result-item">
                <span class="result-label">${labels[key] || key}:</span>
                <span class="result-value">${value}</span>
            </div>`;
    }

    // Caso especial para checkbox si no se marcó
    if (!formData.has('newsletter')) {
        html += `
            <div class="result-item">
                <span class="result-label">Suscripción:</span>
                <span class="result-value text-muted">No suscrito</span>
            </div>`;
    }

    resultContent.innerHTML = html;
    
    // Mostrar resultado y ocultar placeholder
    noResult.classList.add('d-none');
    resultContainer.classList.remove('d-none');

    // Feedback visual en el botón
    const btn = this.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="bi bi-check-lg"></i> ¡Enviado!';
    btn.classList.replace('btn-primary', 'btn-success');
    
    setTimeout(() => {
        btn.innerHTML = originalText;
        btn.classList.replace('btn-success', 'btn-primary');
    }, 2000);
});
