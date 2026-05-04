document.addEventListener('DOMContentLoaded', () => {
    const linksContainer = document.getElementById('links-container');
    const changeLog = document.getElementById('change-log');
    const btnCreate = document.getElementById('btnCreateNodes');
    const btnModify = document.getElementById('btnModifyAttrs');
    const modifySection = document.getElementById('modify-section');
    const newUrlInput = document.getElementById('new-url');

    let createdNodes = [];

    function addLog(msg) {
        if (changeLog.querySelector('p.text-muted')) changeLog.innerHTML = '';
        const entry = document.createElement('div');
        entry.className = 'log-entry';
        entry.innerHTML = msg;
        changeLog.prepend(entry);
    }

    btnCreate.addEventListener('click', () => {
        linksContainer.innerHTML = '';
        createdNodes = [];
        
        for (let i = 1; i <= 5; i++) {
            const a = document.createElement('a');
            a.href = 'https://www.google.com';
            a.target = '_blank';
            a.className = 'custom-link shadow-sm';
            a.innerHTML = `<span><i class="bi bi-link"></i> Enlace ${i}</span> <small class="text-muted">google.com</small>`;
            
            linksContainer.appendChild(a);
            createdNodes.push(a);
        }

        modifySection.classList.remove('d-none');
        addLog('Se crearon <span class="attr">5 nodos &lt;a&gt;</span> con href inicial <span class="val">google.com</span>');
        btnCreate.disabled = true;
    });

    btnModify.addEventListener('click', () => {
        const newUrl = newUrlInput.value || 'https://www.bing.com';
        
        createdNodes.forEach((node, index) => {
            const oldHref = node.href;
            node.href = newUrl;
            node.querySelector('small').textContent = new URL(newUrl).hostname;
            
            addLog(`Nodo ${index + 1}: Atributo <span class="attr">href</span> cambiado de <span class="val">${oldHref}</span> a <span class="val">${newUrl}</span>`);
        });

        // Feedback visual
        btnModify.classList.replace('btn-warning', 'btn-success');
        setTimeout(() => btnModify.classList.replace('btn-success', 'btn-warning'), 1000);
    });
});
