// ============================================
// PANEL DE ADMINISTRACIÓN
// ============================================

// ============ CONFIGURACIÓN ============
const API_URL = 'https://backend-tienda-production-8536.up.railway.app/api';
const ADMIN_PASSWORD = 'admin123'; // Cambia esta contraseña

// ============ ELEMENTOS DEL DOM ============
const loginContainer = document.getElementById('login-container');
const formLogin = document.getElementById('form-login');
const errorLogin = document.getElementById('error-login');
const btnCerrarSesion = document.getElementById('btn-cerrar-sesion');
const listaProductosAdmin = document.getElementById('lista-productos-admin');
const listaPedidos = document.getElementById('lista-pedidos');
const btnAgregar = document.getElementById('btn-agregar-producto');
const modalProducto = document.getElementById('modal-producto');
const modalClose = document.getElementById('modal-close');
const formProducto = document.getElementById('form-producto');
const modalTitulo = document.getElementById('modal-titulo');
const productoId = document.getElementById('producto-id');

// ============ ELEMENTOS PARA SUBIR IMÁGENES ============
const inputImagen = document.getElementById('imagen-upload');
const previewImagen = document.getElementById('preview-imagen');
const previewImg = document.getElementById('preview-img');
const imagenUrl = document.getElementById('imagen-url');
const imagenPublicId = document.getElementById('imagen-public-id');
const btnEliminarImagen = document.getElementById('btn-eliminar-imagen');
const inputImagenTexto = document.getElementById('imagen');

// ============ LOGIN ============
formLogin.addEventListener('submit', function(e) {
    e.preventDefault();
    const password = document.getElementById('password-login').value;
    
    if (password === ADMIN_PASSWORD) {
        loginContainer.style.display = 'none';
        localStorage.setItem('admin_session', 'true');
        cargarProductos();
        cargarPedidos();
    } else {
        errorLogin.style.display = 'block';
        setTimeout(() => errorLogin.style.display = 'none', 3000);
    }
});

// Verificar sesión al cargar
if (localStorage.getItem('admin_session') === 'true') {
    loginContainer.style.display = 'none';
    cargarProductos();
    cargarPedidos();
}

// Cerrar sesión
btnCerrarSesion.addEventListener('click', function(e) {
    e.preventDefault();
    localStorage.removeItem('admin_session');
    loginContainer.style.display = 'flex';
    document.getElementById('password-login').value = '';
});

// ============ NAVEGACIÓN ENTRE SECCIONES ============
document.querySelectorAll('nav ul li a').forEach(link => {
    link.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href && href.startsWith('#')) {
            e.preventDefault();
            const targetId = href.substring(1);
            
            document.querySelectorAll('.admin-section').forEach(section => {
                section.style.display = 'none';
            });
            
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.style.display = 'block';
            }
            
            document.querySelectorAll('nav ul li a').forEach(a => a.classList.remove('active'));
            this.classList.add('active');
        }
    });
});

// ============ SUBIR IMAGEN A CLOUDINARY ============

// Subir imagen al seleccionar archivo
inputImagen.addEventListener('change', async function(e) {
    const file = this.files[0];
    if (!file) return;
    
    // Validar tipo de archivo
    const tiposPermitidos = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!tiposPermitidos.includes(file.type)) {
        alert('❌ Formato no permitido. Usa JPG, PNG, WEBP o GIF.');
        this.value = '';
        return;
    }
    
    // Validar tamaño (5MB)
    if (file.size > 5 * 1024 * 1024) {
        alert('❌ La imagen es demasiado grande. Máximo 5MB.');
        this.value = '';
        return;
    }
    
    // Mostrar preview local
    const reader = new FileReader();
    reader.onload = function(e) {
        previewImg.src = e.target.result;
        previewImagen.style.display = 'block';
    };
    reader.readAsDataURL(file);
    
    try {
        const formData = new FormData();
        formData.append('imagen', file);
        
        const token = localStorage.getItem('token');
        if (!token) {
            alert('❌ Debes iniciar sesión como administrador');
            return;
        }
        
        const response = await fetch(`${API_URL}/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        
        const data = await response.json();
        
        if (data.exito) {
            // Guardar URL de la imagen
            imagenUrl.value = data.imagen.url;
            imagenPublicId.value = data.imagen.public_id;
            inputImagenTexto.value = data.imagen.url;
            
            console.log('✅ Imagen subida a Cloudinary:', data.imagen.public_id);
        } else {
            alert('❌ Error al subir imagen: ' + data.mensaje);
            previewImagen.style.display = 'none';
        }
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error al conectar con el servidor');
    }
});

// Eliminar imagen subida
btnEliminarImagen.addEventListener('click', async function() {
    const publicId = imagenPublicId.value;
    
    if (!publicId) {
        previewImagen.style.display = 'none';
        imagenUrl.value = '';
        imagenPublicId.value = '';
        inputImagenTexto.value = '';
        inputImagen.value = '';
        return;
    }
    
    if (!confirm('¿Eliminar esta imagen de Cloudinary?')) return;
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/upload/${publicId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (data.exito) {
            previewImagen.style.display = 'none';
            imagenUrl.value = '';
            imagenPublicId.value = '';
            inputImagenTexto.value = '';
            inputImagen.value = '';
            alert('✅ Imagen eliminada de Cloudinary');
        } else {
            alert('❌ Error al eliminar imagen: ' + data.mensaje);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error al eliminar imagen');
    }
});

// ============ CARGAR PRODUCTOS ============
async function cargarProductos() {
    try {
        const respuesta = await fetch(`${API_URL}/productos`);
        const datos = await respuesta.json();
        
        if (datos.exito) {
            renderizarProductosAdmin(datos.productos);
        }
    } catch (error) {
        console.error('Error al cargar productos:', error);
    }
}

function renderizarProductosAdmin(productos) {
    if (!listaProductosAdmin) return;
    
    if (!productos || productos.length === 0) {
        listaProductosAdmin.innerHTML = '<p style="text-align:center; padding:40px; color:#888;">📦 No hay productos</p>';
        return;
    }
    
    let html = '';
    productos.forEach(producto => {
        const precio = parseFloat(producto.precio) || 0;
        // Si la imagen es una URL de Cloudinary, usarla directamente
        const imagenSrc = producto.imagen && producto.imagen.startsWith('http') 
            ? producto.imagen 
            : `../img/${producto.imagen || 'default.jpg'}`;
        
        html += `
            <div class="producto-admin-card" data-id="${producto.id}">
                <img src="${imagenSrc}" alt="${producto.nombre}" 
                     onerror="this.src='https://via.placeholder.com/60/cccccc/555?text=?'">
                <div class="info">
                    <h4>${producto.nombre}</h4>
                    <div class="detalles">
                        <span>💰 S/ ${precio.toFixed(2)}</span>
                        <span>📦 Stock: ${producto.stock || 0}</span>
                        <span>🏷️ ${producto.categoria}</span>
                    </div>
                </div>
                <div class="acciones">
                    <button class="btn-editar" data-id="${producto.id}">✏️ Editar</button>
                    <button class="btn-eliminar" data-id="${producto.id}">🗑️ Eliminar</button>
                </div>
            </div>
        `;
    });
    
    listaProductosAdmin.innerHTML = html;
    
    // Eventos de botones
    document.querySelectorAll('.btn-editar').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = parseInt(this.dataset.id);
            abrirModalEditar(id);
        });
    });
    
    document.querySelectorAll('.btn-eliminar').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = parseInt(this.dataset.id);
            eliminarProducto(id);
        });
    });
}

// ============ AGREGAR/EDITAR PRODUCTO ============
btnAgregar.addEventListener('click', function() {
    modalTitulo.textContent = 'Agregar Producto';
    productoId.value = '';
    formProducto.reset();
    // Limpiar vista previa de imagen
    previewImagen.style.display = 'none';
    imagenUrl.value = '';
    imagenPublicId.value = '';
    inputImagenTexto.value = '';
    inputImagen.value = '';
    modalProducto.style.display = 'flex';
});

modalClose.addEventListener('click', function() {
    modalProducto.style.display = 'none';
});

modalProducto.addEventListener('click', function(e) {
    if (e.target === modalProducto) {
        modalProducto.style.display = 'none';
    }
});

formProducto.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const id = productoId.value;
    const datos = {
        nombre: document.getElementById('nombre').value,
        categoria: document.getElementById('categoria').value,
        precio: parseFloat(document.getElementById('precio').value),
        stock: parseInt(document.getElementById('stock').value),
        imagen: imagenUrl.value || document.getElementById('imagen').value || 'default.jpg',
        descripcion: document.getElementById('descripcion').value
    };
    
    try {
        let respuesta;
        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
        
        if (id) {
            // Editar
            respuesta = await fetch(`${API_URL}/productos/${id}`, {
                method: 'PUT',
                headers: headers,
                body: JSON.stringify(datos)
            });
        } else {
            // Crear
            respuesta = await fetch(`${API_URL}/productos`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(datos)
            });
        }
        
        const resultado = await respuesta.json();
        
        if (resultado.exito) {
            alert(id ? '✅ Producto actualizado' : '✅ Producto agregado');
            modalProducto.style.display = 'none';
            cargarProductos();
        } else {
            alert('❌ Error: ' + resultado.mensaje);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error al guardar producto');
    }
});

async function abrirModalEditar(id) {
    try {
        const respuesta = await fetch(`${API_URL}/productos/${id}`);
        const datos = await respuesta.json();
        
        if (datos.exito) {
            const p = datos.producto;
            modalTitulo.textContent = 'Editar Producto';
            productoId.value = p.id;
            document.getElementById('nombre').value = p.nombre;
            document.getElementById('categoria').value = p.categoria;
            document.getElementById('precio').value = p.precio;
            document.getElementById('stock').value = p.stock;
            document.getElementById('imagen').value = p.imagen || '';
            document.getElementById('descripcion').value = p.descripcion || '';
            
            // Cargar imagen existente
            const imagenActual = p.imagen || '';
            if (imagenActual && imagenActual !== 'default.jpg' && imagenActual.startsWith('http')) {
                previewImg.src = imagenActual;
                previewImagen.style.display = 'block';
                imagenUrl.value = imagenActual;
                // Intentar extraer public_id
                const match = imagenActual.match(/\/upload\/(?:v\d+\/)?(.+)\.\w+$/);
                if (match) {
                    imagenPublicId.value = match[1];
                }
            } else {
                previewImagen.style.display = 'none';
                imagenUrl.value = '';
                imagenPublicId.value = '';
            }
            
            modalProducto.style.display = 'flex';
        }
    } catch (error) {
        console.error('Error al obtener producto:', error);
    }
}

// ============ ELIMINAR PRODUCTO ============
async function eliminarProducto(id) {
    if (!confirm('¿Seguro que quieres eliminar este producto?')) return;
    
    try {
        const token = localStorage.getItem('token');
        const respuesta = await fetch(`${API_URL}/productos/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const resultado = await respuesta.json();
        
        if (resultado.exito) {
            alert('✅ Producto eliminado');
            cargarProductos();
        } else {
            alert('❌ Error: ' + resultado.mensaje);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error al eliminar producto');
    }
}

// ============ CARGAR PEDIDOS ============
async function cargarPedidos() {
    try {
        const token = localStorage.getItem('token');
        const respuesta = await fetch(`${API_URL}/pedidos`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const datos = await respuesta.json();
        
        if (datos.exito) {
            renderizarPedidos(datos.pedidos);
        } else {
            console.error('Error al cargar pedidos:', datos.mensaje);
        }
    } catch (error) {
        console.error('Error al cargar pedidos:', error);
    }
}

function renderizarPedidos(pedidos) {
    if (!listaPedidos) return;
    
    if (!pedidos || pedidos.length === 0) {
        listaPedidos.innerHTML = '<p style="text-align:center; padding:40px; color:#888;">📭 No hay pedidos aún</p>';
        return;
    }
    
    let html = '';
    pedidos.forEach(pedido => {
        const total = parseFloat(pedido.total) || 0;
        const fecha = new Date(pedido.fecha);
        const fechaStr = fecha.toLocaleString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        html += `
            <div class="pedido-card">
                <div class="header">
                    <span class="cliente">👤 ${pedido.cliente_nombre || 'Cliente'}</span>
                    <span class="total">S/ ${total.toFixed(2)}</span>
                    <span class="estado">${pedido.estado || 'pendiente'}</span>
                </div>
                <div class="detalles">
                    ${pedido.detalles && Array.isArray(pedido.detalles) && pedido.detalles.length > 0 
                        ? pedido.detalles.map(d => 
                            `<div class="item">
                                <span>Producto ID: ${d.producto_id}</span>
                                <span>${d.cantidad} x S/ ${(parseFloat(d.precio_unitario) || 0).toFixed(2)}</span>
                            </div>`
                          ).join('')
                        : '<p style="color:#999; font-size:0.9rem;">Sin detalles</p>'
                    }
                </div>
                <small style="color:#999; display:block; margin-top:8px;">📅 ${fechaStr}</small>
            </div>
        `;
    });
    
    listaPedidos.innerHTML = html;
}

// ============ FILTROS ============
document.querySelectorAll('.filtro-btn').forEach(btn => {
    btn.addEventListener('click', async function() {
        document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        
        const filtro = this.dataset.filtro;
        
        try {
            let url = `${API_URL}/productos`;
            if (filtro !== 'todos') {
                url = `${API_URL}/productos/categoria/${filtro}`;
            }
            const respuesta = await fetch(url);
            const datos = await respuesta.json();
            
            if (datos.exito) {
                renderizarProductosAdmin(datos.productos || []);
            }
        } catch (error) {
            console.error('Error al filtrar:', error);
        }
    });
});

console.log('🛠️ Panel de administración cargado');
console.log('🔗 Conectado a:', API_URL);