// Toggle del dropdown del carrito y cierre al hacer clic fuera
    (function() {
        const btn = document.getElementById('cartButton');
        const dropdown = document.getElementById('cartDropdown');
        const cart = document.getElementById('cart');

        function setExpanded(val) {
            btn.setAttribute('aria-expanded', String(val));
            dropdown.style.display = val ? 'block' : 'none';
        }

        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const opened = btn.getAttribute('aria-expanded') === 'true';
            setExpanded(!opened);
        });

        document.addEventListener('click', function(e) {
            if (!cart.contains(e.target)) setExpanded(false);
        });

        // keyboard: ESC to close
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') setExpanded(false);
        });

        // iniciar cerrado
        setExpanded(false);
    })();