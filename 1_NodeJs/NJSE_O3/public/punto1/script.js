document.addEventListener('DOMContentLoaded', () => {
    const outputArea = document.getElementById('output-area');
    const emptyMsg = document.getElementById('empty-msg');
    
    let h1Element = null;
    let imgElement = null;
    let imgIndex = 1;
    let imgWidth = 300;

    // Agregar H1
    document.getElementById('btnAddH1').addEventListener('click', () => {
        if (!h1Element) {
            emptyMsg.style.display = 'none';
            h1Element = document.createElement('h1');
            h1Element.id = 'h1-target';
            h1Element.textContent = 'Hola DOM';
            outputArea.prepend(h1Element);
        }
    });

    // Cambiar Texto H1
    document.getElementById('btnChangeH1').addEventListener('click', () => {
        if (h1Element) {
            h1Element.textContent = h1Element.textContent === 'Hola DOM' ? 'Chau DOM' : 'Hola DOM';
        } else {
            alert('¡Primero agrega el H1!');
        }
    });

    // Cambiar Color H1
    document.getElementById('btnColorH1').addEventListener('click', () => {
        if (h1Element) {
            const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16);
            h1Element.style.color = randomColor;
        } else {
            alert('¡Primero agrega el H1!');
        }
    });

    // Agregar Imagen
    document.getElementById('btnAddImg').addEventListener('click', () => {
        if (!imgElement) {
            emptyMsg.style.display = 'none';
            imgElement = document.createElement('img');
            imgElement.id = 'img-target';
            imgElement.src = '/images/imagen1.jpg';
            imgElement.style.width = imgWidth + 'px';
            outputArea.appendChild(imgElement);
        }
    });

    // Cambiar Imagen
    document.getElementById('btnChangeImg').addEventListener('click', () => {
        if (imgElement) {
            imgIndex = imgIndex === 1 ? 2 : 1;
            imgElement.src = `/images/imagen${imgIndex}.jpg`;
        } else {
            alert('¡Primero agrega una imagen!');
        }
    });

    // Cambiar Tamaño Imagen
    document.getElementById('btnSizeImg').addEventListener('click', () => {
        if (imgElement) {
            imgWidth = imgWidth >= 500 ? 200 : imgWidth + 50;
            imgElement.style.width = imgWidth + 'px';
        } else {
            alert('¡Primero agrega una imagen!');
        }
    });
});
