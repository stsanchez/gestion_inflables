// JavaScript para la administración de inflables
let inflables = [];
let inflableAEliminar = null;

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Inicializando administración de inflables...');
    cargarInflables();
    configurarEventListeners();
});

// Configurar event listeners
function configurarEventListeners() {
    // Filtros
    document.getElementById('filtroEstado').addEventListener('change', aplicarFiltros);
    document.getElementById('buscarNombre').addEventListener('input', aplicarFiltros);
    
    // Modal de inflable
    const modalInflable = document.getElementById('modalInflable');
    modalInflable.addEventListener('hidden.bs.modal', function() {
        limpiarFormulario();
    });
    
    // Preview de imagen
    document.getElementById('imagen').addEventListener('change', function(e) {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
                document.getElementById('previewImagen').src = e.target.result;
                document.getElementById('imagenActual').style.display = 'block';
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    });
}

// Cargar inflables desde la API
async function cargarInflables() {
    try {
        console.log('📦 Cargando inflables...');
        const response = await fetch('/api/inflables/admin');
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        inflables = await response.json();
        console.log(`✅ Cargados ${inflables.length} inflables`);
        mostrarInflables(inflables);
    } catch (error) {
        console.error('❌ Error cargando inflables:', error);
        mostrarError('Error cargando inflables: ' + error.message);
    }
}

// Mostrar inflables en la interfaz
function mostrarInflables(inflablesFiltrados) {
    const container = document.getElementById('listaInflables');
    
    if (inflablesFiltrados.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="fas fa-balloon fa-3x text-muted mb-3"></i>
                <h5 class="text-muted">No se encontraron inflables</h5>
                <p class="text-muted">Intenta ajustar los filtros o agrega un nuevo inflable.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = inflablesFiltrados.map(inflable => `
        <div class="col-md-6 col-lg-4 mb-4">
            <div class="card h-100 ${inflable.activo ? '' : 'border-warning'}">
                <div class="card-img-top-container" style="height: 200px; overflow: hidden;">
                    ${inflable.imagen_url ? 
                        `<img src="${inflable.imagen_url}" class="card-img-top" style="object-fit: cover; height: 100%;" alt="${inflable.nombre}">` :
                        `<div class="d-flex align-items-center justify-content-center bg-light" style="height: 100%;">
                            <i class="fas fa-balloon fa-3x text-muted"></i>
                        </div>`
                    }
                </div>
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${inflable.nombre}</h5>
                    <p class="card-text text-muted">${inflable.descripcion || 'Sin descripción'}</p>
                    <div class="mt-auto">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <span class="h5 text-success mb-0">$${inflable.precio_diario}</span>
                            <span class="badge ${inflable.activo ? 'bg-success' : 'bg-warning'}">
                                ${inflable.activo ? 'Activo' : 'Inactivo'}
                            </span>
                        </div>
                        <div class="btn-group w-100" role="group">
                            <button class="btn btn-outline-primary btn-sm" onclick="editarInflable(${inflable.id})">
                                <i class="fas fa-edit"></i> Editar
                            </button>
                            ${inflable.activo ? 
                                `<button class="btn btn-outline-warning btn-sm" onclick="eliminarInflable(${inflable.id})">
                                    <i class="fas fa-ban"></i> Desactivar
                                </button>` :
                                `<button class="btn btn-outline-success btn-sm" onclick="reactivarInflable(${inflable.id})">
                                    <i class="fas fa-check"></i> Reactivar
                                </button>`
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Aplicar filtros
function aplicarFiltros() {
    const estadoFiltro = document.getElementById('filtroEstado').value;
    const nombreBusqueda = document.getElementById('buscarNombre').value.toLowerCase();
    
    let inflablesFiltrados = inflables;
    
    // Filtrar por estado
    if (estadoFiltro !== 'todos') {
        inflablesFiltrados = inflablesFiltrados.filter(inflable => 
            estadoFiltro === 'activos' ? inflable.activo : !inflable.activo
        );
    }
    
    // Filtrar por nombre
    if (nombreBusqueda) {
        inflablesFiltrados = inflablesFiltrados.filter(inflable => 
            inflable.nombre.toLowerCase().includes(nombreBusqueda)
        );
    }
    
    mostrarInflables(inflablesFiltrados);
}

// Editar inflable
function editarInflable(id) {
    const inflable = inflables.find(i => i.id === id);
    if (!inflable) return;
    
    // Llenar formulario
    document.getElementById('inflableId').value = inflable.id;
    document.getElementById('nombre').value = inflable.nombre;
    document.getElementById('precio_diario').value = inflable.precio_diario;
    document.getElementById('descripcion').value = inflable.descripcion || '';
    
    // Mostrar imagen actual si existe
    if (inflable.imagen_url) {
        document.getElementById('previewImagen').src = inflable.imagen_url;
        document.getElementById('imagenActual').style.display = 'block';
    } else {
        document.getElementById('imagenActual').style.display = 'none';
    }
    
    // Cambiar título del modal
    document.getElementById('tituloModal').textContent = 'Editar Inflable';
    
    // Mostrar modal
    const modal = new bootstrap.Modal(document.getElementById('modalInflable'));
    modal.show();
}

// Eliminar inflable (marcar como inactivo)
function eliminarInflable(id) {
    inflableAEliminar = id;
    const modal = new bootstrap.Modal(document.getElementById('modalConfirmarEliminar'));
    modal.show();
}

// Reactivar inflable
async function reactivarInflable(id) {
    try {
        const response = await fetch(`/api/inflables/${id}/reactivar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        mostrarExito('Inflable reactivado exitosamente');
        cargarInflables();
    } catch (error) {
        console.error('❌ Error reactivando inflable:', error);
        mostrarError('Error reactivando inflable: ' + error.message);
    }
}

// Confirmar eliminación
async function confirmarEliminacion() {
    if (!inflableAEliminar) return;
    
    try {
        const response = await fetch(`/api/inflables/${inflableAEliminar}/desactivar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        mostrarExito('Inflable desactivado exitosamente');
        cargarInflables();
        
        // Cerrar modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('modalConfirmarEliminar'));
        modal.hide();
        
        inflableAEliminar = null;
    } catch (error) {
        console.error('❌ Error desactivando inflable:', error);
        mostrarError('Error desactivando inflable: ' + error.message);
    }
}

// Guardar inflable
async function guardarInflable() {
    const formData = new FormData();
    const inflableId = document.getElementById('inflableId').value;
    const nombre = document.getElementById('nombre').value;
    const precio_diario = document.getElementById('precio_diario').value;
    const descripcion = document.getElementById('descripcion').value;
    const imagen = document.getElementById('imagen').files[0];
    
    // Validar campos requeridos
    if (!nombre || !precio_diario) {
        mostrarError('Por favor completa todos los campos requeridos');
        return;
    }
    
    // Preparar datos
    formData.append('nombre', nombre);
    formData.append('precio_diario', precio_diario);
    formData.append('descripcion', descripcion);
    
    if (imagen) {
        formData.append('imagen', imagen);
    }
    
    try {
        const url = inflableId ? `/api/inflables/${inflableId}` : '/api/inflables';
        const method = inflableId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            body: formData
        });
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const resultado = await response.json();
        console.log('✅ Inflable guardado:', resultado);
        
        mostrarExito(inflableId ? 'Inflable actualizado exitosamente' : 'Inflable creado exitosamente');
        
        // Cerrar modal y recargar lista
        const modal = bootstrap.Modal.getInstance(document.getElementById('modalInflable'));
        modal.hide();
        
        cargarInflables();
        
    } catch (error) {
        console.error('❌ Error guardando inflable:', error);
        mostrarError('Error guardando inflable: ' + error.message);
    }
}

// Limpiar formulario
function limpiarFormulario() {
    document.getElementById('formInflable').reset();
    document.getElementById('inflableId').value = '';
    document.getElementById('imagenActual').style.display = 'none';
    document.getElementById('tituloModal').textContent = 'Nuevo Inflable';
}

// Mostrar mensaje de éxito
function mostrarExito(mensaje) {
    // Crear toast de éxito
    const toast = document.createElement('div');
    toast.className = 'toast align-items-center text-white bg-success border-0';
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                <i class="fas fa-check-circle me-2"></i>${mensaje}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;
    
    document.body.appendChild(toast);
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
    
    // Remover toast después de que se oculte
    toast.addEventListener('hidden.bs.toast', () => {
        document.body.removeChild(toast);
    });
}

// Mostrar mensaje de error
function mostrarError(mensaje) {
    // Crear toast de error
    const toast = document.createElement('div');
    toast.className = 'toast align-items-center text-white bg-danger border-0';
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                <i class="fas fa-exclamation-circle me-2"></i>${mensaje}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;
    
    document.body.appendChild(toast);
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
    
    // Remover toast después de que se oculte
    toast.addEventListener('hidden.bs.toast', () => {
        document.body.removeChild(toast);
    });
}
