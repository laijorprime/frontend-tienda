// ============================================
// 1. CONFIGURACIÓN
// ============================================

const API_URL = 'http://localhost:3000/api';
let productos = [];
let cargando = false;

// Elementos del DOM
const contenedorProductos = document.getElementById('lista-productos');
const botonesFiltro = document.querySelectorAll('.filtro-btn');

// ============================================
// 2. CARGAR PRODUCTOS DESDE BACKEND
// ============================================

async function cargarProductos() {
    if (cargando) return;
    cargando = true;
    
    // Mostrar mensaje de carga
    if (contenedorProductos) {
        contenedorProductos.innerHTML = `
            <div style="text-align:center; padding:60px 20px; grid-column: 1 / -1;">
                <p style="font-size:1.2rem; color:#777;">🔄 Conectando con el servidor...</p>
                <div style="width:40px; height:40px; border:4px solid #f0f0f0; border-top:4px solid #c0392b; border-radius:50%; margin:20px auto; animation: girar 1s linear infinite;"></div>
            </div>
        `;
    }
    
    try {
        console.log('🔄 Intentando conectar al backend...');
        const respuesta = await fetch(`${API_URL}/productos`);
        
        if (!respuesta.ok) {
            throw new Error(`Error HTTP: ${respuesta.status}`);
        }
        
        const datos = await respuesta.json();
        
        if (datos.exito && datos.productos && datos.productos.length > 0) {
            productos = datos.productos;
            renderizarProductos(productos);
            console.log(`✅ ${productos.length} productos cargados del backend`);
        } else {
            throw new Error(datos.mensaje || 'No hay productos disponibles');
        }
    } catch (error) {
        console.error('❌ Error de conexión:', error.message);
        console.log('📦 Usando productos locales como respaldo');
        cargarProductosLocales();
    } finally {
        cargando = false;
    }
}

// ============================================
// 3. PRODUCTOS DE RESPALDO (MODO OFFLINE)
// ============================================

function cargarProductosLocales() {
    productos = [
        { 
            id: 1, 
            nombre: 'Batidora Planetaria 5L', 
            categoria: 'batidoras', 
            precio: 890.00, 
            imagen: 'batidora-planetaria.jpg', 
            descripcion: 'Ideal para masas pesadas. Incluye 3 accesorios.' 
        },
        { 
            id: 2, 
            nombre: 'Set de Moldes Desmontables', 
            categoria: 'moldes', 
            precio: 120.00, 
            imagen: 'moldes-desmontables.jpg', 
            descripcion: 'Pack de 3 moldes de 20, 24 y 28 cm.' 
        },
        { 
            id: 3, 
            nombre: 'Manga Pastelera + 12 Boquillas', 
            categoria: 'decoracion', 
            precio: 85.00, 
            imagen: 'manga-pastelera.jpg', 
            descripcion: 'Set completo para decoración profesional.' 
        },
        { 
            id: 4, 
            nombre: 'Batidora de Mano 600W', 
            categoria: 'batidoras', 
            precio: 230.00, 
            imagen: 'batidora-mano.jpg', 
            descripcion: 'Turbo + 5 velocidades. Incluye batidores y gancho.' 
        },
        { 
            id: 5, 
            nombre: 'Molde Silicona Cupcakes', 
            categoria: 'moldes', 
            precio: 45.00, 
            imagen: 'silicona-cupcakes.jpg', 
            descripcion: 'Antiadherente, 12 cavidades. Hasta 230°C.' 
        },
        { 
            id: 6, 
            nombre: 'Kit Colorantes en Gel', 
            categoria: 'decoracion', 
            precio: 65.00, 
            imagen: 'colorantes-gel.jpg', 
            descripcion: '6 colores intensos para glaseado y fondant.' 
        }
    ];
    renderizarProductos(productos);
    console.log(`📦 ${productos.length} productos locales cargados (modo respaldo)`);
}

// ============================================
// 4. RENDERIZAR PRODUCTOS EN EL GRID (MEJORADO)
// ============================================

function renderizarProductos(lista) {
    // VALIDACIÓN 1: Verificar que el contenedor existe
    if (!contenedorProductos) {
        console.error('❌ Contenedor de productos no encontrado');
        return;
    }
    
    // VALIDACIÓN 2: Verificar que la lista existe y tiene elementos
    if (!lista || lista.length === 0) {
        console.warn('⚠️ Lista de productos vacía');
        contenedorProductos.innerHTML = `
            <div style="text-align:center; padding:60px 20px; grid-column: 1 / -1;">
                <p style="font-size:1.2rem; color:#777;">📦 No hay productos disponibles</p>
            </div>
        `;
        return;
    }
    
    // VALIDACIÓN 3: Limpiar el contenedor ANTES de renderizar
    contenedorProductos.innerHTML = '';
    
    // Renderizar cada producto
    lista.forEach(producto => {
        const card = document.createElement('div');
        card.className = 'producto-card';
        card.dataset.categoria = producto.categoria || 'general';
        
        // Manejar imagen con respaldo
        const imagenSrc = producto.imagen ? `img/${producto.imagen}` : 'https://via.placeholder.com/260x220/f0f0f0/c0392b?text=Sin+Imagen';
        
        card.innerHTML = `
            <img src="${imagenSrc}" alt="${producto.nombre || 'Producto'}" 
                 onerror="this.src='https://via.placeholder.com/260x220/f0f0f0/c0392b?text=Sin+Imagen'">
            <div class="producto-info">
                <span class="categoria-tag">${producto.categoria || 'general'}</span>
                <h3>${producto.nombre || 'Producto'}</h3>
                <p style="color:#777; font-size:0.9rem;">${producto.descripcion || 'Sin descripción'}</p>
                <p class="precio">S/ ${(producto.precio || 0).toFixed(2)}</p>
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
    
    console.log(`✅ Renderizados ${lista.length} productos`);
}

// ============================================
// 5. FILTROS POR CATEGORÍA
// ============================================

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
// 6. CARRITO DE COMPRAS (LocalStorage)
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
    const btn = e.target.closest('.btn-agregar');
    if (!btn) return;
    
    const id = parseInt(btn.dataset.id);
    const producto = productos.find(p => p.id === id);
    
    if (!producto) {
        console.error('Producto no encontrado:', id);
        return;
    }
    
    // Buscar si ya existe en el carrito
    const existente = carrito.find(item => item.id === id);
    
    if (existente) {
        existente.cantidad += 1;
    } else {
        carrito.push({
            id: producto.id,
            nombre: producto.nombre,
            precio: producto.precio,
            imagen: producto.imagen || 'default.jpg',
            cantidad: 1
        });
    }
    
    localStorage.setItem('carritoReposteria', JSON.stringify(carrito));
    actualizarContador();
    
    // Feedback visual
    btn.textContent = '✅ Agregado';
    btn.style.background = '#27ae60';
    setTimeout(() => {
        btn.innerHTML = '<i class="fas fa-cart-plus"></i> Agregar al carrito';
        btn.style.background = '';
    }, 1500);
}

function verCarrito() {
    console.log('=== MI CARRITO ===');
    carrito.forEach(item => {
        console.log(`${item.nombre} x${item.cantidad} = S/ ${(item.precio * item.cantidad).toFixed(2)}`);
    });
    const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    console.log(`TOTAL: S/ ${total.toFixed(2)}`);
}

// ============================================
// 7. ENVIAR PEDIDO AL BACKEND
// ============================================

async function enviarPedido(datosPedido) {
    try {
        const respuesta = await fetch(`${API_URL}/pedidos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datosPedido)
        });
        
        const resultado = await respuesta.json();
        
        if (resultado.exito) {
            console.log('✅ Pedido enviado:', resultado.pedido);
            alert(`✅ ¡Pedido #${resultado.pedido.id} registrado!`);
            return resultado.pedido;
        } else {
            console.error('Error al enviar pedido:', resultado.mensaje);
            alert(`❌ Error: ${resultado.mensaje}`);
            return null;
        }
    } catch (error) {
        console.error('Error de conexión:', error);
        alert('❌ No se pudo conectar con el servidor. Revisa que el backend esté corriendo.');
        return null;
    }
}

function finalizarCompra() {
    if (carrito.length === 0) {
        alert('🛒 El carrito está vacío');
        return;
    }
    
    const datosPedido = {
        cliente: {
            nombre: prompt('Ingresa tu nombre:') || 'Cliente',
            email: prompt('Ingresa tu email:') || 'cliente@email.com',
            telefono: prompt('Ingresa tu teléfono:') || '999888777'
        },
        productos: carrito.map(item => ({
            id: item.id,
            nombre: item.nombre,
            cantidad: item.cantidad,
            precio: item.precio
        })),
        total: carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0)
    };
    
    enviarPedido(datosPedido);
}

// ============================================
// 8. FORMULARIO DE CONTACTO CON FORMSPREE
// ============================================

const formContacto = document.getElementById('form-contacto');

if (formContacto) {
    formContacto.addEventListener('submit', function(e) {
        const btnEnviar = this.querySelector('button[type="submit"]');
        const textoOriginal = btnEnviar.textContent;
        btnEnviar.textContent = '📤 Enviando...';
        btnEnviar.disabled = true;
        
        setTimeout(function() {
            btnEnviar.textContent = textoOriginal;
            btnEnviar.disabled = false;
        }, 3000);
    });
}

// ============================================
// 9. INICIALIZAR
// ============================================

// Cargar productos desde el backend
cargarProductos();

// Actualizar contador del carrito
actualizarContador();

console.log('🍰 Tienda de utensilios inicializada');
console.log('🔗 Conectando al backend en:', API_URL);