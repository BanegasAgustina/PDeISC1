document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Doble Click
    const boxDbl = document.getElementById('box-dblclick');
    boxDbl.addEventListener('dblclick', () => {
        boxDbl.classList.toggle('circle');
        boxDbl.textContent = boxDbl.classList.contains('circle') ? '¡Cambié!' : 'Doble Click Aquí';
    });

    // 2. Mouse Over/Out
    const cardHover = document.getElementById('card-hover');
    const hoverTitle = document.getElementById('hover-title');
    const hoverDesc = document.getElementById('hover-desc');

    cardHover.addEventListener('mouseover', () => {
        hoverTitle.textContent = '¡Hola!';
        hoverDesc.classList.remove('d-none');
    });

    cardHover.addEventListener('mouseout', () => {
        hoverTitle.textContent = '¿Qué hay aquí?';
        hoverDesc.classList.add('d-none');
    });

    // 3. Teclado
    const kbInput = document.getElementById('keyboard-input');
    const kbOutput = document.getElementById('keyboard-output');

    kbInput.addEventListener('input', (e) => {
        kbOutput.textContent = e.target.value || '...';
    });

    // 4. Drag & Drop
    const dragItem = document.getElementById('drag-item');
    const dropZone = document.getElementById('drop-zone');

    dragItem.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', 'dragged-item');
        dragItem.style.opacity = '0.5';
    });

    dragItem.addEventListener('dragend', () => {
        dragItem.style.opacity = '1';
    });

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        dropZone.innerHTML = '<i class="bi bi-check-circle-fill text-success fs-1"></i><br>¡Recibido!';
        dragItem.style.display = 'none';
    });

    // 5. Temporizador (Focus/Blur)
    const timerTrigger = document.getElementById('timer-trigger');
    const timerDisplay = document.getElementById('timer-display');
    let count = 0;
    let interval = null;

    timerTrigger.addEventListener('focus', () => {
        if (!interval) {
            interval = setInterval(() => {
                count++;
                timerDisplay.textContent = count;
            }, 1000);
            timerTrigger.classList.add('is-valid');
        }
    });

    timerTrigger.addEventListener('blur', () => {
        clearInterval(interval);
        interval = null;
        timerTrigger.classList.remove('is-valid');
    });
});
