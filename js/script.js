// ============================================
// 1. BASE DE DATOS DE PRODUCTOS (Array de objetos)
// ============================================
const productos = [
    {
        id: 1,
        nombre: 'Batidora Planetaria 5L',
        categoria: 'batidoras',
        precio: 890.00,
        imagen: 'img/batidora-planetaria.jpg',
        descripcion: 'Ideal para masas pesadas. Incluye 3 accesorios.'
    },
    {
        id: 2,
        nombre: 'Set de Moldes Desmontables',
        categoria: 'moldes',
        precio: 120.00,
        imagen: 'img/moldes-desmontables.jpg',
        descripcion: 'Pack de 3 moldes de 20, 24 y 28 cm.'
    },
    {
        id: 3,
        nombre: 'Manga Pastelera + 12 Boquillas',
        categoria: 'decoracion',
        precio: 85.00,
        imagen: 'img/manga-pastelera.jpg',
        descripcion: 'Set completo para decoración profesional.'
    },
    {
        id: 4,
        nombre: 'Batidora de Mano 600W',
        categoria: 'batidoras',
        precio: 230.00,
        imagen: 'img/batidora-mano.jpg',
        descripcion: 'Turbo + 5 velocidades. Incluye batidores y gancho.'
    },
    {
        id: 5,
        nombre: 'Molde Silicona Cupcakes',
        categoria: 'moldes',
        precio: 45.00,
        imagen: 'img/silicona-cupcakes.jpg',
        descripcion: 'Antiadherente, 12 cavidades. Hasta 230°C.'
    },
    {
        id: 6,
        nombre: 'Kit Colorantes en Gel',
        categoria: 'decoracion',
        precio: 65.00,
        imagen: 'img/colorantes-gel.jpg',
        descripcion: '6 colores intensos para glaseado y fondant.'
    },
    {
        id: 7,
        nombre: 'JORGE ',
        categoria: 'puede ',
        precio: 80.00,
        imagen: 'img/jorge.jpg',
        descripcion: '6 colores intensos para glaseado y fondant.'
    }

];

// ============================================
// 2. RENDERIZAR PRODUCTOS EN EL GRID
// ============================================
const contenedorProductos = document.getElementById('lista-productos');

function renderizarProductos(lista) {
    if (!contenedorProductos) return;
    
    contenedorProductos.innerHTML = '';
    
    lista.forEach(producto => {
        const card = document.createElement('div');
        card.className = 'producto-card';
        card.dataset.categoria = producto.categoria;
        
        card.innerHTML = `
            <img src="${producto.imagen}" alt="${producto.nombre}" 
                 onerror="this.src='https://via.placeholder.com/260x220/f0f0f0/c0392b?text=Sin+Imagen'">
            <div class="producto-info">
                <span class="categoria-tag">${producto.categoria}</span>
                <h3>${producto.nombre}</h3>
                <p style="color:#777; font-size:0.9rem;">${producto.descripcion}</p>
                <p class="precio">S/ ${producto.precio.toFixed(2)}</p>
                <button class="btn-agregar" data-id="${producto.id}">
                    <i class="fas fa-cart-plus"></i> Agregar al carrito
                </button>
            </div>
        `;
        
        contenedorProductos.appendChild(card);
    });
    
    // Asignar eventos a los botones "Agregar"
    document.querySelectorAll('.btn-agregar').forEach(btn => {
        btn.addEventListener('click', agregarAlCarrito);
    });
}

// ============================================
// 3. FILTROS POR CATEGORÍA
// ============================================
const botonesFiltro = document.querySelectorAll('.filtro-btn');

botonesFiltro.forEach(btn => {
    btn.addEventListener('click', function() {
        // Quitar clase active de todos
        botonesFiltro.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        
        const filtro = this.dataset.filtro;
        
        if (filtro === 'todos') {
            renderizarProductos(productos);
        } else {
            const filtrados = productos.filter(p => p.categoria === filtro);
            renderizarProductos(filtrados);
        }
    });
});

// ============================================
// 4. CARRITO DE COMPRAS (LocalStorage)
// ============================================
let carrito = JSON.parse(localStorage.getItem('carritoReposteria')) || [];

function actualizarContador() {
    const contador = document.querySelector('.contador');
    if (contador) {
        const total = carrito.reduce((sum, item) => sum + item.cantidad, 0);
        contador.textContent = total;
    }
}

function agregarAlCarrito(e) {
    const id = parseInt(e.target.dataset.id || e.target.closest('.btn-agregar').dataset.id);
    const producto = productos.find(p => p.id === id);
    
    if (!producto) return;
    
    // Buscar si ya existe en el carrito
    const existente = carrito.find(item => item.id === id);
    
    if (existente) {
        existente.cantidad += 1;
    } else {
        carrito.push({
            id: producto.id,
            nombre: producto.nombre,
            precio: producto.precio,
            imagen: producto.imagen,
            cantidad: 1
        });
    }
    
    localStorage.setItem('carritoReposteria', JSON.stringify(carrito));
    actualizarContador();
    
    // Feedback visual
    const btn = e.target.closest('.btn-agregar');
    if (btn) {
        btn.textContent = '✅ Agregado';
        btn.style.background = '#27ae60';
        setTimeout(() => {
            btn.innerHTML = '<i class="fas fa-cart-plus"></i> Agregar al carrito';
            btn.style.background = '';
        }, 1500);
    }
}

// ============================================
// 5. FORMULARIO DE CONTACTO
// ============================================
const formContacto = document.getElementById('form-contacto');
if (formContacto) {
    formContacto.addEventListener('submit', function(e) {
        e.preventDefault();
        alert('¡Gracias por contactarnos! Te responderemos en menos de 24 horas.');
        this.reset();
    });
}


// Verificar si el carrito está vacío y mostrar mensaje
function verificarCarritoVacio() {
    if (carrito.length === 0) {
        console.log('🛒 El carrito está vacío');
        // Puedes mostrar un mensaje en la página
    }
}

function verCarrito() {
    console.log('=== MI CARRITO ===');
    carrito.forEach(item => {
        console.log(`${item.nombre} x${item.cantidad} = S/ ${(item.precio * item.cantidad).toFixed(2)}`);
    });
    const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    console.log(`TOTAL: S/ ${total.toFixed(2)}`);
}





verificarCarritoVacio();

// ============================================
// 6. INICIALIZAR
// ============================================
renderizarProductos(productos);
actualizarContador();

console.log('🛒 Tienda de utensilios cargada correctamente');
console.log(`📦 ${productos.length} productos disponibles`);