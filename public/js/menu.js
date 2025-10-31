document.addEventListener('DOMContentLoaded', function() {
    const menuButton = document.getElementById('menuButton');
    const menu = document.getElementById('menu');

    menuButton.addEventListener('click', function() {
        menu.classList.toggle('open');
        menuButton.textContent = menu.classList.contains('open') ? '✕' : '☰';
    });
});
