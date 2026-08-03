// ============================================
// 1. CONFIGURACIÓN
// ============================================

const API_URL = 'https://backend-tienda-production-8536.up.railway.app/api';
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

function cargarProductosLocales() {
    productos = [
        { id: 1, nombre: 'Batidora Planetaria 5L', categoria: 'batidoras', precio: 890.00, imagen: 'batidora-planetaria.jpg', descripcion: 'Ideal para masas pesadas.' },
        { id: 2, nombre: 'Set de Moldes Desmontables', categoria: 'moldes', precio: 120.00, imagen: 'moldes-desmontables.jpg', descripcion: 'Pack de 3 moldes.' },
        { id: 3, nombre: 'Manga Pastelera + 12 Boquillas', categoria: 'decoracion', precio: 85.00, imagen: 'manga-pastelera.jpg', descripcion: 'Set completo para decoración.' },
        { id: 4, nombre: 'Batidora de Mano 600W', categoria: 'batidoras', precio: 230.00, imagen: 'batidora-mano.jpg', descripcion: 'Turbo + 5 velocidades.' },
        { id: 5, nombre: 'Molde Silicona Cupcakes', categoria: 'moldes', precio: 45.00, imagen: 'silicona-cupcakes.jpg', descripcion: 'Antiadherente.' },
        { id: 6, nombre: 'Kit Colorantes en Gel', categoria: 'decoracion', precio: 65.00, imagen: 'colorantes-gel.jpg', descripcion: '6 colores intensos.' }
    ];
    renderizarProductos(productos);
    console.log(`📦 ${productos.length} productos locales cargados (modo respaldo)`);
}

// ============================================
// 3. RENDERIZAR PRODUCTOS
// ============================================

function renderizarProductos(lista) {
    if (!contenedorProductos) {
        console.error('❌ Contenedor de productos no encontrado');
        return;
    }
    
    if (!lista || lista.length === 0) {
        contenedorProductos.innerHTML = `
            <div style="text-align:center; padding:60px 20px; grid-column: 1 / -1;">
                <p style="font-size:1.2rem; color:#777;">📦 No hay productos disponibles</p>
            </div>
        `;
        return;
    }
    
    contenedorProductos.innerHTML = '';
    
    lista.forEach(producto => {
        const card = document.createElement('div');
        card.className = 'producto-card';
        card.dataset.categoria = producto.categoria || 'general';
        
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
    
    document.querySelectorAll('.btn-agregar').forEach(btn => {
        btn.addEventListener('click', agregarAlCarrito);
    });
    
    console.log(`✅ Renderizados ${lista.length} productos`);
}

// ============================================
// 4. FILTROS
// ============================================

botonesFiltro.forEach(btn => {
    btn.addEventListener('click', function() {
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
// 5. CARRITO DE COMPRAS
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
    
    btn.textContent = '✅ Agregado';
    btn.style.background = '#27ae60';
    setTimeout(() => {
        btn.innerHTML = '<i class="fas fa-cart-plus"></i> Agregar al carrito';
        btn.style.background = '';
    }, 1500);
}

// ============================================
// 6. MODAL DEL CARRITO - VERSIÓN CORREGIDA
// ============================================

// Elementos del DOM para el carrito
const modalCarrito = document.getElementById('modal-carrito');
const cerrarCarrito = document.getElementById('cerrar-carrito');
const listaCarrito = document.getElementById('lista-carrito');
const totalCarrito = document.getElementById('total-carrito');
const btnFinalizar = document.getElementById('btn-finalizar-compra');

// Verificar que los elementos existan
console.log('🔍 Verificando elementos del modal:');
console.log('✅ modalCarrito:', modalCarrito);
console.log('✅ cerrarCarrito:', cerrarCarrito);
console.log('✅ listaCarrito:', listaCarrito);
console.log('✅ totalCarrito:', totalCarrito);
console.log('✅ btnFinalizar:', btnFinalizar);

// Función para ABRIR el modal (FORZANDO display)
function abrirModalCarrito() {
    console.log('🛒 Abriendo modal...');
    
    // Verificar que el modal existe
    if (!modalCarrito) {
        console.error('❌ Modal no encontrado en el DOM');
        return;
    }
    
    // FORZAR la visibilidad
    modalCarrito.style.display = 'flex';
    modalCarrito.style.visibility = 'visible';
    modalCarrito.style.opacity = '1';
    document.body.style.overflow = 'hidden'; // Bloquear scroll
    
    // Renderizar el contenido
    renderizarCarrito();
    
    console.log('✅ Modal abierto');
}

// Función para CERRAR el modal
function cerrarModalCarrito() {
    console.log('❌ Cerrando modal...');
    
    if (!modalCarrito) return;
    
    modalCarrito.style.display = 'none';
    modalCarrito.style.visibility = 'hidden';
    modalCarrito.style.opacity = '0';
    document.body.style.overflow = 'auto'; // Restaurar scroll
}

// Evento: clic en el ícono del carrito
document.querySelector('.carrito-icono').addEventListener('click', function(e) {
    e.stopPropagation();
    e.preventDefault(); // Prevenir comportamiento predeterminado
    abrirModalCarrito();
});

// Evento: clic en la X para cerrar
if (cerrarCarrito) {
    cerrarCarrito.addEventListener('click', cerrarModalCarrito);
}

// Evento: clic fuera del modal
if (modalCarrito) {
    modalCarrito.addEventListener('click', function(e) {
        if (e.target === modalCarrito) {
            cerrarModalCarrito();
        }
    });
}

// Evento: tecla ESC
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modalCarrito && modalCarrito.style.display === 'flex') {
        cerrarModalCarrito();
    }
});

// Función para renderizar el contenido del carrito
function renderizarCarrito() {
    console.log('📦 Renderizando carrito...');
    
    // Verificar que el contenedor existe
    if (!listaCarrito) {
        console.error('❌ listaCarrito no encontrado');
        return;
    }
    
    const carrito = JSON.parse(localStorage.getItem('carritoReposteria')) || [];
    console.log('Carrito actual:', carrito);
    
    if (carrito.length === 0) {
        listaCarrito.innerHTML = `
            <div style="text-align:center; padding:40px 0;">
                <i class="fas fa-shopping-cart" style="font-size:3rem; color:#ddd;"></i>
                <p style="color:#888; font-size:1.1rem; margin-top:15px;">
                    🛒 Tu carrito está vacío
                </p>
                <p style="color:#aaa; font-size:0.9rem;">
                    Agrega productos desde nuestro catálogo
                </p>
            </div>
        `;
        if (totalCarrito) totalCarrito.textContent = 'S/ 0.00';
        if (btnFinalizar) btnFinalizar.style.display = 'none';
        return;
    }
    
    if (btnFinalizar) btnFinalizar.style.display = 'block';
    
    let html = '';
    let total = 0;
    
    carrito.forEach((item, index) => {
        const subtotal = item.precio * item.cantidad;
        total += subtotal;
        
        html += `
            <div class="item-carrito" data-index="${index}">
                <img src="img/${item.imagen || 'default.jpg'}" 
                     alt="${item.nombre}"
                     onerror="this.src='https://via.placeholder.com/60/cccccc/555?text=?'">
                <div class="info">
                    <h4>${item.nombre}</h4>
                    <div class="precio-item">S/ ${item.precio.toFixed(2)} c/u</div>
                </div>
                <div class="cantidad-control">
                    <button class="btn-restar" data-index="${index}">-</button>
                    <span>${item.cantidad}</span>
                    <button class="btn-sumar" data-index="${index}">+</button>
                </div>
                <button class="btn-eliminar" data-index="${index}">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        `;
    });
    
    listaCarrito.innerHTML = html;
    if (totalCarrito) totalCarrito.textContent = `S/ ${total.toFixed(2)}`;
    
    // Eventos de los botones del carrito
    document.querySelectorAll('.btn-sumar').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.dataset.index);
            const carritoActual = JSON.parse(localStorage.getItem('carritoReposteria')) || [];
            if (carritoActual[index]) {
                carritoActual[index].cantidad += 1;
                localStorage.setItem('carritoReposteria', JSON.stringify(carritoActual));
                renderizarCarrito();
                actualizarContador();
            }
        });
    });
    
    document.querySelectorAll('.btn-restar').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.dataset.index);
            let carritoActual = JSON.parse(localStorage.getItem('carritoReposteria')) || [];
            if (carritoActual[index]) {
                if (carritoActual[index].cantidad > 1) {
                    carritoActual[index].cantidad -= 1;
                } else {
                    carritoActual.splice(index, 1);
                }
                localStorage.setItem('carritoReposteria', JSON.stringify(carritoActual));
                renderizarCarrito();
                actualizarContador();
            }
        });
    });
    
    document.querySelectorAll('.btn-eliminar').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.dataset.index);
            let carritoActual = JSON.parse(localStorage.getItem('carritoReposteria')) || [];
            carritoActual.splice(index, 1);
            localStorage.setItem('carritoReposteria', JSON.stringify(carritoActual));
            renderizarCarrito();
            actualizarContador();
        });
    });
}

// ============================================
// 7. FINALIZAR COMPRA
// ============================================

async function enviarPedido(datosPedido) {
    try {
        const respuesta = await fetch(`${API_URL}/pedidos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosPedido)
        });
        const resultado = await respuesta.json();
        if (resultado.exito) {
            alert(`✅ ¡Pedido #${resultado.pedido.id} registrado!`);
            localStorage.removeItem('carritoReposteria');
            renderizarCarrito();
            actualizarContador();
            cerrarModalCarrito();
        } else {
            alert(`❌ Error: ${resultado.mensaje}`);
        }
    } catch (error) {
        alert('❌ No se pudo conectar con el servidor.');
    }
}

function finalizarCompra() {
    const carrito = JSON.parse(localStorage.getItem('carritoReposteria')) || [];
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

if (btnFinalizar) {
    btnFinalizar.addEventListener('click', finalizarCompra);
}

const modal = document.getElementById('modal-carrito');
modal.style.cssText = 'position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.7); z-index:9999; display:flex; justify-content:center; align-items:center;';


// ============================================
// 8. INICIALIZAR
// ============================================

cargarProductos();
actualizarContador();
console.log('🍰 Tienda de utensilios inicializada');
console.log('🔗 Conectando al backend en:', API_URL);