// Variables globales
let calendar;
let inflables = [];
let reservas = [];

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM cargado, iniciando aplicación...');
    checkFullCalendar();
});

let fullCalendarAttempts = 0;
const maxAttempts = 50; // 5 segundos máximo

function checkFullCalendar() {
    if (typeof FullCalendar !== 'undefined') {
        console.log('✅ FullCalendar cargado, iniciando aplicación...');
        initializeApp();
    } else {
        fullCalendarAttempts++;
        if (fullCalendarAttempts >= maxAttempts) {
            console.warn('⚠️ FullCalendar no se pudo cargar, iniciando sin calendario...');
            initializeAppWithoutCalendar();
        } else {
            console.log(`⏳ Esperando FullCalendar... (${fullCalendarAttempts}/${maxAttempts})`);
            setTimeout(checkFullCalendar, 100);
        }
    }
}

function initializeAppWithoutCalendar() {
    console.log('🚀 Inicializando aplicación sin calendario...');
    loadInflables();
    loadReservas();
    setupEventListeners();
    console.log('✅ Aplicación inicializada (sin calendario)');
}

function initializeApp() {
    console.log('🚀 Inicializando aplicación...');
    loadInflables();
    loadReservas();
    initializeCalendar();
    setupEventListeners();
    console.log('✅ Aplicación inicializada');
}

// Navegación entre secciones
function showSection(sectionName) {
    console.log('🔄 Cambiando a sección:', sectionName);
    
    // Ocultar todas las secciones
    const sections = document.querySelectorAll('.section');
    console.log('📦 Secciones encontradas:', sections.length);
    sections.forEach(section => {
        section.style.display = 'none';
    });
    
    // Mostrar la sección seleccionada
    const targetSection = document.getElementById(sectionName + '-section');
    console.log('🎯 Sección objetivo:', sectionName + '-section', targetSection);
    if (targetSection) {
        targetSection.style.display = 'block';
        console.log('✅ Sección mostrada:', sectionName);
    } else {
        console.error('❌ Sección no encontrada:', sectionName + '-section');
    }
    
    // Actualizar navbar
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Cargar datos específicos según la sección
    if (sectionName === 'calendario') {
        loadCalendarEvents();
    }
}

// Cargar inflables
async function loadInflables() {
    console.log('📦 Cargando inflables...');
    try {
        const response = await fetch('/api/inflables');
        inflables = await response.json();
        console.log(`📦 Cargados ${inflables.length} inflables`);
        renderInflables();
    } catch (error) {
        console.error('Error cargando inflables:', error);
        showAlert('Error al cargar los inflables', 'danger');
    }
}

function renderInflables() {
    console.log('🎨 Renderizando inflables...');
    console.log('📦 Datos de inflables:', inflables);
    const container = document.getElementById('inflables-list');
    
    if (!container) {
        console.error('❌ Elemento inflables-list no encontrado');
        return;
    }
    
    console.log('✅ Elemento inflables-list encontrado');
    container.innerHTML = '';
    
    if (inflables.length === 0) {
        console.log('⚠️ No hay inflables para mostrar');
        container.innerHTML = `
            <div class="col-12">
                <div class="alert alert-info text-center">
                    <i class="fas fa-info-circle me-2"></i>
                    No hay inflables registrados. ¡Agrega el primero!
                </div>
            </div>
        `;
        return;
    }
    
    console.log(`🎨 Renderizando ${inflables.length} inflables`);
    console.log('📦 Datos de inflables:', inflables);
    
    inflables.forEach(inflable => {
        const card = document.createElement('div');
        card.className = 'col-md-6 col-lg-4 mb-4';
        card.innerHTML = `
            <div class="card inflable-card h-100">
                ${inflable.imagen_url ? `<img src="${inflable.imagen_url}" class="card-img-top inflable-img" alt="${inflable.nombre}" onerror="this.style.display='none'">` : ''}
                <div class="card-header">
                    <h5 class="mb-0">${inflable.nombre}</h5>
                </div>
                <div class="card-body">
                    <p class="card-text">${inflable.descripcion || 'Sin descripción'}</p>
                    <div class="d-flex justify-content-between align-items-center">
                        <span class="precio">$${inflable.precio_diario.toFixed(2)}/día</span>
                        <div class="btn-group" role="group">
                            <button class="btn btn-outline-primary btn-sm" onclick="checkDisponibilidad(${inflable.id})">
                                <i class="fas fa-calendar-check me-1"></i>Verificar
                            </button>
                            <button class="btn btn-outline-info btn-sm" onclick="showInflableDetails(${inflable.id})">
                                <i class="fas fa-info-circle me-1"></i>Detalles
                            </button>
                            <button class="btn btn-outline-secondary btn-sm" onclick="showInflableHistory(${inflable.id})">
                                <i class="fas fa-history me-1"></i>Historial
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// Cargar reservas
async function loadReservas() {
    console.log('📅 Cargando reservas...');
    try {
        const response = await fetch('/api/reservas');
        reservas = await response.json();
        console.log(`📅 Cargadas ${reservas.length} reservas`);
        renderReservas();
    } catch (error) {
        console.error('Error cargando reservas:', error);
        showAlert('Error al cargar las reservas', 'danger');
    }
}

function renderReservas() {
    console.log('🎨 Renderizando reservas...');
    console.log('📅 Datos de reservas:', reservas);
    const tbody = document.getElementById('reservas-table');
    
    if (!tbody) {
        console.error('❌ Elemento reservas-table no encontrado');
        return;
    }
    
    console.log('✅ Elemento reservas-table encontrado');
    tbody.innerHTML = '';
    
    if (reservas.length === 0) {
        console.log('⚠️ No hay reservas para mostrar');
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-muted">
                    <i class="fas fa-calendar-times me-2"></i>
                    No hay reservas registradas
                </td>
            </tr>
        `;
        return;
    }
    
    console.log(`🎨 Renderizando ${reservas.length} reservas`);
    console.log('📅 Datos de reservas:', reservas);
    
    reservas.forEach(reserva => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${reserva.inflable}</td>
            <td>${reserva.cliente}</td>
            <td>${formatDate(reserva.fecha_inicio)}</td>
            <td>${formatDate(reserva.fecha_fin)}</td>
            <td>$${reserva.precio_total.toFixed(2)}</td>
            <td><span class="estado-${reserva.estado}">${reserva.estado.charAt(0).toUpperCase() + reserva.estado.slice(1)}</span></td>
            <td>
                <button class="btn btn-outline-primary btn-action" onclick="editReserva(${reserva.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-outline-danger btn-action" onclick="deleteReserva(${reserva.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Inicializar calendario
function initializeCalendar() {
    console.log('📅 Inicializando calendario...');
    const calendarEl = document.getElementById('calendar');
    
    if (!calendarEl) {
        console.error('❌ Elemento calendar no encontrado');
        return;
    }
    
    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'es',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,listWeek'
        },
        buttonText: {
            today: 'Hoy',
            month: 'Mes',
            week: 'Semana',
            list: 'Lista'
        },
        eventClick: function(info) {
            showEventDetails(info.event);
        },
        dateClick: function(info) {
            showNewReservaModal(info.dateStr);
        },
        events: function(info, successCallback, failureCallback) {
            console.log('📅 Cargando eventos del calendario...');
            const fecha = info.start;
            const mes = fecha.getMonth() + 1;
            const año = fecha.getFullYear();
            
            fetch(`/api/calendario?mes=${mes}&año=${año}`)
                .then(response => response.json())
                .then(eventos => {
                    console.log(`📅 Cargados ${eventos.length} eventos para ${mes}/${año}`);
                    successCallback(eventos);
                })
                .catch(error => {
                    console.error('❌ Error cargando eventos:', error);
                    failureCallback(error);
                });
        }
    });
    
    calendar.render();
    console.log('✅ Calendario inicializado');
}

// Cargar eventos del calendario
async function loadCalendarEvents() {
    try {
        const today = new Date();
        const response = await fetch(`/api/calendario?mes=${today.getMonth() + 1}&año=${today.getFullYear()}`);
        const eventos = await response.json();
        
        calendar.removeAllEvents();
        eventos.forEach(evento => {
            calendar.addEvent(evento);
        });
    } catch (error) {
        console.error('Error cargando eventos del calendario:', error);
    }
}

// Verificar disponibilidad
async function checkDisponibilidad(inflableId) {
    const fechaInicio = prompt('Ingrese la fecha de inicio (YYYY-MM-DD):');
    const fechaFin = prompt('Ingrese la fecha de fin (YYYY-MM-DD):');
    
    if (!fechaInicio || !fechaFin) return;
    
    try {
        const response = await fetch(`/api/disponibilidad?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`);
        const disponibles = await response.json();
        
        const inflable = disponibles.find(i => i.id === inflableId);
        if (inflable) {
            showAlert(`El inflable "${inflable.nombre}" está disponible en esas fechas`, 'success');
        } else {
            showAlert('El inflable no está disponible en esas fechas', 'warning');
        }
    } catch (error) {
        console.error('Error verificando disponibilidad:', error);
        showAlert('Error al verificar disponibilidad', 'danger');
    }
}

// Guardar inflable
async function saveInflable() {
    const form = document.getElementById('formInflable');
    const imagenFile = document.getElementById('imagen').files[0];
    
    try {
        let response;
        
        if (imagenFile) {
            // Subir archivo
            const formData = new FormData();
            formData.append('nombre', document.getElementById('nombre').value);
            formData.append('descripcion', document.getElementById('descripcion').value);
            formData.append('precio_diario', document.getElementById('precio_diario').value);
            formData.append('imagen', imagenFile);
            
            response = await fetch('/api/inflables', {
                method: 'POST',
                body: formData
            });
        } else {
            // Sin archivo, enviar JSON
            const data = {
                nombre: document.getElementById('nombre').value,
                descripcion: document.getElementById('descripcion').value,
                precio_diario: parseFloat(document.getElementById('precio_diario').value),
                imagen_url: ''
            };
            
            response = await fetch('/api/inflables', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
        }
        
        if (response.ok) {
            showAlert('Inflable creado exitosamente', 'success');
            bootstrap.Modal.getInstance(document.getElementById('modalInflable')).hide();
            form.reset();
            loadInflables();
        } else {
            const error = await response.json();
            showAlert(error.error || 'Error al crear inflable', 'danger');
        }
    } catch (error) {
        console.error('Error guardando inflable:', error);
        showAlert('Error al guardar inflable', 'danger');
    }
}

// Guardar reserva
async function saveReserva() {
    const form = document.getElementById('formReserva');
    const data = {
        fecha_inicio: document.getElementById('fecha_inicio').value,
        fecha_fin: document.getElementById('fecha_fin').value,
        inflable_id: parseInt(document.getElementById('inflable_select').value),
        cliente: {
            nombre: document.getElementById('cliente_nombre').value,
            telefono: document.getElementById('cliente_telefono').value,
            email: document.getElementById('cliente_email').value,
            direccion: document.getElementById('cliente_direccion').value
        },
        notas: document.getElementById('notas').value
    };
    
    try {
        const response = await fetch('/api/reservas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            showAlert('Reserva creada exitosamente', 'success');
            bootstrap.Modal.getInstance(document.getElementById('modalReserva')).hide();
            form.reset();
            loadReservas();
            loadCalendarEvents();
        } else {
            const error = await response.json();
            showAlert(error.error || 'Error al crear reserva', 'danger');
        }
    } catch (error) {
        console.error('Error guardando reserva:', error);
        showAlert('Error al guardar reserva', 'danger');
    }
}

// Cargar inflables disponibles para el select
async function loadDisponibles() {
    const fechaInicio = document.getElementById('fecha_inicio').value;
    const fechaFin = document.getElementById('fecha_fin').value;
    
    if (!fechaInicio || !fechaFin) {
        return;
    }
    
    try {
        const response = await fetch(`/api/disponibilidad?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`);
        const disponibles = await response.json();
        
        const select = document.getElementById('inflable_select');
        if (!select) {
            return;
        }
        
        select.innerHTML = '<option value="">Seleccione un inflable...</option>';
        
        disponibles.forEach(inflable => {
            const option = document.createElement('option');
            option.value = inflable.id;
            option.textContent = `${inflable.nombre} - $${inflable.precio_diario}/día`;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error cargando inflables disponibles:', error);
    }
}

// Configurar event listeners
function setupEventListeners() {
    // Event listeners para fechas en el modal de reserva
    const fechaInicio = document.getElementById('fecha_inicio');
    const fechaFin = document.getElementById('fecha_fin');
    
    if (fechaInicio) {
        fechaInicio.addEventListener('change', loadDisponibles);
    }
    
    if (fechaFin) {
        fechaFin.addEventListener('change', loadDisponibles);
    }
    
    // Cargar inflables en el select cuando se abre el modal
    const modalReserva = document.getElementById('modalReserva');
    if (modalReserva) {
        modalReserva.addEventListener('show.bs.modal', function() {
            loadDisponibles();
        });
    }
    
    // Event listener para el formulario de búsqueda
    const searchForm = document.getElementById('searchForm');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            searchDisponibilidad();
        });
    }
}

// Mostrar nueva reserva desde calendario
function showNewReservaModal(fecha) {
    document.getElementById('fecha_inicio').value = fecha;
    document.getElementById('fecha_fin').value = fecha;
    loadDisponibles();
    new bootstrap.Modal(document.getElementById('modalReserva')).show();
}

// Mostrar nueva reserva desde botón
function showNewReservaModalFromButton() {
    // Limpiar fechas
    document.getElementById('fecha_inicio').value = '';
    document.getElementById('fecha_fin').value = '';
    
    // Limpiar select de inflables
    const select = document.getElementById('inflable_select');
    if (select) {
        select.innerHTML = '<option value="">Seleccione un inflable...</option>';
    }
    
    // Mostrar modal
    const modal = new bootstrap.Modal(document.getElementById('modalReserva'));
    modal.show();
}

// Mostrar detalles del evento
function showEventDetails(event) {
    alert(`Reserva: ${event.title}\nFecha: ${event.start.toLocaleDateString()}`);
}

// Utilidades
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('es-ES');
}

function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    alertDiv.style.top = '20px';
    alertDiv.style.right = '20px';
    alertDiv.style.zIndex = '9999';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.parentNode.removeChild(alertDiv);
        }
    }, 5000);
}

// Búsqueda de disponibilidad
async function searchDisponibilidad() {
    console.log('🔍 Iniciando búsqueda de disponibilidad...');
    
    const fechaInicio = document.getElementById('search_fecha_inicio').value;
    const fechaFin = document.getElementById('search_fecha_fin').value;
    
    console.log(`📅 Fechas seleccionadas: ${fechaInicio} - ${fechaFin}`);
    
    if (!fechaInicio || !fechaFin) {
        console.log('⚠️ Fechas no seleccionadas');
        showAlert('Por favor, seleccione ambas fechas', 'warning');
        return;
    }
    
    if (new Date(fechaInicio) > new Date(fechaFin)) {
        console.log('⚠️ Fecha de inicio posterior a fecha de fin');
        showAlert('La fecha de inicio debe ser anterior a la fecha de fin', 'warning');
        return;
    }
    
    try {
        showLoading(true);
        console.log(`🌐 Haciendo petición a: /api/disponibilidad?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`);
        
        const response = await fetch(`/api/disponibilidad?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`);
        
        console.log(`📡 Respuesta recibida: ${response.status}`);
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Error en la respuesta del servidor');
        }
        
        const disponibles = await response.json();
        console.log(`📋 Resultados: ${disponibles.length} inflables disponibles`);
        
        showSearchResults(disponibles, fechaInicio, fechaFin);
    } catch (error) {
        console.error('❌ Error buscando disponibilidad:', error);
        showAlert(`Error al buscar disponibilidad: ${error.message}`, 'danger');
    } finally {
        showLoading(false);
    }
}

function showSearchResults(disponibles, fechaInicio, fechaFin) {
    const resultsContainer = document.getElementById('search-results');
    const contentContainer = document.getElementById('search-results-content');
    const originalList = document.getElementById('inflables-list');
    
    // Ocultar la lista original de inflables
    if (originalList) {
        originalList.style.display = 'none';
    }
    
    if (disponibles.length === 0) {
        contentContainer.innerHTML = `
            <div class="alert alert-warning text-center">
                <i class="fas fa-exclamation-triangle me-2"></i>
                No hay inflables disponibles para el rango de fechas seleccionado
                <br><small class="text-muted">${formatDate(fechaInicio)} - ${formatDate(fechaFin)}</small>
            </div>
        `;
    } else {
        const dias = Math.ceil((new Date(fechaFin) - new Date(fechaInicio)) / (1000 * 60 * 60 * 24)) + 1;
        
        contentContainer.innerHTML = `
            <div class="row mb-3">
                <div class="col-md-6">
                    <h6><i class="fas fa-calendar-alt me-2"></i>Período: ${formatDate(fechaInicio)} - ${formatDate(fechaFin)}</h6>
                </div>
                <div class="col-md-6 text-end">
                    <span class="badge bg-success fs-6">${disponibles.length} inflable${disponibles.length !== 1 ? 's' : ''} disponible${disponibles.length !== 1 ? 's' : ''}</span>
                </div>
            </div>
            <div class="row">
                ${disponibles.map(inflable => `
                    <div class="col-md-6 col-lg-4 mb-3">
                        <div class="card h-100 border-success">
                            ${inflable.imagen_url ? `<img src="${inflable.imagen_url}" class="card-img-top search-img" alt="${inflable.nombre}" onerror="this.style.display='none'">` : ''}
                            <div class="card-header bg-success text-white">
                                <h6 class="mb-0">${inflable.nombre}</h6>
                            </div>
                            <div class="card-body">
                                <p class="card-text small">${inflable.descripcion || 'Sin descripción'}</p>
                                <div class="d-flex justify-content-between align-items-center">
                                    <div>
                                        <span class="text-muted small">Precio por día:</span><br>
                                        <span class="h5 text-success mb-0">$${inflable.precio_diario.toFixed(2)}</span>
                                    </div>
                                    <div class="text-end">
                                        <span class="text-muted small">Total (${dias} día${dias !== 1 ? 's' : ''}):</span><br>
                                        <span class="h5 text-primary mb-0">$${(inflable.precio_diario * dias).toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                            <div class="card-footer bg-light">
                                <button class="btn btn-success btn-sm w-100" onclick="reservarInflable(${inflable.id}, '${fechaInicio}', '${fechaFin}')">
                                    <i class="fas fa-calendar-plus me-1"></i>Reservar Ahora
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    resultsContainer.style.display = 'block';
    resultsContainer.scrollIntoView({ behavior: 'smooth' });
}

function clearSearchFilter() {
    console.log('🧹 Limpiando filtro de búsqueda...');
    
    // Mostrar la lista original de inflables
    const originalList = document.getElementById('inflables-list');
    if (originalList) {
        originalList.style.display = 'block';
    }
    
    // Ocultar los resultados de búsqueda
    const resultsContainer = document.getElementById('search-results');
    if (resultsContainer) {
        resultsContainer.style.display = 'none';
    }
    
    // Limpiar los campos de fecha
    document.getElementById('search_fecha_inicio').value = '';
    document.getElementById('search_fecha_fin').value = '';
    
    console.log('✅ Filtro limpiado, mostrando todos los inflables');
}

function reservarInflable(inflableId, fechaInicio, fechaFin) {
    // Llenar el modal de reserva con los datos
    document.getElementById('fecha_inicio').value = fechaInicio;
    document.getElementById('fecha_fin').value = fechaFin;
    
    // Cargar inflables disponibles y seleccionar el correcto
    loadDisponibles().then(() => {
        document.getElementById('inflable_select').value = inflableId;
        new bootstrap.Modal(document.getElementById('modalReserva')).show();
    });
}

function showLoading(show) {
    const button = document.querySelector('#searchForm button[type="submit"]');
    if (show) {
        button.innerHTML = '<span class="loading"></span> Buscando...';
        button.disabled = true;
    } else {
        button.innerHTML = '<i class="fas fa-search me-1"></i>Buscar Disponibles';
        button.disabled = false;
    }
}

// Mostrar detalles del inflable
async function showInflableDetails(inflableId) {
    try {
        // Obtener información del inflable
        const inflable = inflables.find(i => i.id === inflableId);
        if (!inflable) {
            showAlert('Inflable no encontrado', 'danger');
            return;
        }

        // Cargar reservas próximas
        const response = await fetch(`/api/inflables/${inflableId}/reservas?tipo=proximas`);
        const reservas = await response.json();

        // Mostrar información del inflable
        document.getElementById('inflableDetailsTitle').textContent = `Detalles: ${inflable.nombre}`;
        document.getElementById('inflableInfo').innerHTML = `
            ${inflable.imagen_url ? `<img src="${inflable.imagen_url}" class="img-fluid rounded mb-3" alt="${inflable.nombre}" onerror="this.style.display='none'">` : ''}
            <h6>${inflable.nombre}</h6>
            <p class="text-muted">${inflable.descripcion || 'Sin descripción'}</p>
            <hr>
            <div class="d-flex justify-content-between">
                <span class="text-muted">Precio diario:</span>
                <span class="fw-bold text-success">$${inflable.precio_diario.toFixed(2)}</span>
            </div>
        `;

        // Mostrar reservas próximas
        if (reservas.length === 0) {
            document.getElementById('proximasReservas').innerHTML = `
                <div class="alert alert-info text-center">
                    <i class="fas fa-calendar-check me-2"></i>
                    No hay reservas próximas para este inflable
                </div>
            `;
        } else {
            document.getElementById('proximasReservas').innerHTML = `
                <div class="table-responsive">
                    <table class="table table-sm table-hover">
                        <thead>
                            <tr>
                                <th>Cliente</th>
                                <th>Teléfono</th>
                                <th>Fechas</th>
                                <th>Precio</th>
                                <th>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${reservas.map(reserva => `
                                <tr>
                                    <td>
                                        <strong>${reserva.cliente}</strong>
                                        ${reserva.email ? `<br><small class="text-muted">${reserva.email}</small>` : ''}
                                    </td>
                                    <td>${reserva.telefono}</td>
                                    <td>
                                        <small>
                                            ${formatDate(reserva.fecha_inicio)}<br>
                                            <span class="text-muted">a</span><br>
                                            ${formatDate(reserva.fecha_fin)}
                                        </small>
                                    </td>
                                    <td class="text-success fw-bold">$${reserva.precio_total.toFixed(2)}</td>
                                    <td><span class="estado-${reserva.estado}">${reserva.estado.charAt(0).toUpperCase() + reserva.estado.slice(1)}</span></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        }

        // Mostrar modal
        new bootstrap.Modal(document.getElementById('modalInflableDetails')).show();
    } catch (error) {
        console.error('Error cargando detalles:', error);
        showAlert('Error al cargar los detalles del inflable', 'danger');
    }
}

// Mostrar historial del inflable
async function showInflableHistory(inflableId) {
    try {
        // Obtener información del inflable
        const inflable = inflables.find(i => i.id === inflableId);
        if (!inflable) {
            showAlert('Inflable no encontrado', 'danger');
            return;
        }

        // Cargar historial de reservas
        const response = await fetch(`/api/inflables/${inflableId}/reservas?tipo=historial`);
        const historial = await response.json();

        // Mostrar información del inflable
        document.getElementById('inflableHistoryTitle').textContent = `Historial: ${inflable.nombre}`;
        document.getElementById('inflableHistoryInfo').innerHTML = `
            ${inflable.imagen_url ? `<img src="${inflable.imagen_url}" class="img-fluid rounded mb-3" alt="${inflable.nombre}" onerror="this.style.display='none'">` : ''}
            <h6>${inflable.nombre}</h6>
            <p class="text-muted">${inflable.descripcion || 'Sin descripción'}</p>
            <hr>
            <div class="d-flex justify-content-between">
                <span class="text-muted">Precio diario:</span>
                <span class="fw-bold text-success">$${inflable.precio_diario.toFixed(2)}</span>
            </div>
            <hr>
            <div class="text-center">
                <span class="badge bg-secondary fs-6">${historial.length} reservas completadas</span>
            </div>
        `;

        // Mostrar historial
        if (historial.length === 0) {
            document.getElementById('historialReservas').innerHTML = `
                <div class="alert alert-info text-center">
                    <i class="fas fa-history me-2"></i>
                    No hay historial de reservas para este inflable
                </div>
            `;
        } else {
            document.getElementById('historialReservas').innerHTML = `
                <div class="table-responsive">
                    <table class="table table-sm table-hover">
                        <thead>
                            <tr>
                                <th>Cliente</th>
                                <th>Teléfono</th>
                                <th>Fechas</th>
                                <th>Precio</th>
                                <th>Notas</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${historial.map(reserva => `
                                <tr>
                                    <td>
                                        <strong>${reserva.cliente}</strong>
                                        ${reserva.email ? `<br><small class="text-muted">${reserva.email}</small>` : ''}
                                    </td>
                                    <td>${reserva.telefono}</td>
                                    <td>
                                        <small>
                                            ${formatDate(reserva.fecha_inicio)}<br>
                                            <span class="text-muted">a</span><br>
                                            ${formatDate(reserva.fecha_fin)}
                                        </small>
                                    </td>
                                    <td class="text-success fw-bold">$${reserva.precio_total.toFixed(2)}</td>
                                    <td>
                                        ${reserva.notas ? `<small class="text-muted">${reserva.notas}</small>` : '<span class="text-muted">-</span>'}
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        }

        // Mostrar modal
        new bootstrap.Modal(document.getElementById('modalInflableHistory')).show();
    } catch (error) {
        console.error('Error cargando historial:', error);
        showAlert('Error al cargar el historial del inflable', 'danger');
    }
}

// Funciones para editar/eliminar reservas
async function editReserva(id) {
    console.log(`🔧 Editando reserva ID: ${id}`);
    
    try {
        // Cargar datos de la reserva
        const response = await fetch(`/api/reservas/${id}`);
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const reserva = await response.json();
        console.log('📋 Datos de la reserva:', reserva);
        
        // Llenar formulario de edición
        document.getElementById('edit_reserva_id').value = reserva.id;
        document.getElementById('edit_fecha_inicio').value = reserva.fecha_inicio;
        document.getElementById('edit_fecha_fin').value = reserva.fecha_fin;
        document.getElementById('edit_estado').value = reserva.estado;
        document.getElementById('edit_notas').value = reserva.notas || '';
        document.getElementById('edit_precio_total').value = reserva.precio_total;
        
        // Cargar clientes e inflables
        await cargarClientesParaEdicion();
        await cargarInflablesParaEdicion();
        
        // Seleccionar cliente e inflable actuales
        document.getElementById('edit_cliente_select').value = reserva.cliente_id;
        document.getElementById('edit_inflable_select').value = reserva.inflable_id;
        
        // Mostrar modal
        const modal = new bootstrap.Modal(document.getElementById('modalEditarReserva'));
        modal.show();
        
    } catch (error) {
        console.error('❌ Error cargando reserva:', error);
        showAlert('Error cargando datos de la reserva: ' + error.message, 'danger');
    }
}

async function cargarClientesParaEdicion() {
    try {
        const response = await fetch('/api/clientes');
        const clientes = await response.json();
        
        const select = document.getElementById('edit_cliente_select');
        select.innerHTML = '<option value="">Seleccione un cliente...</option>';
        
        clientes.forEach(cliente => {
            const option = document.createElement('option');
            option.value = cliente.id;
            option.textContent = `${cliente.nombre} - ${cliente.email}`;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('❌ Error cargando clientes:', error);
    }
}

async function cargarInflablesParaEdicion() {
    try {
        const response = await fetch('/api/inflables');
        const inflables = await response.json();
        
        const select = document.getElementById('edit_inflable_select');
        select.innerHTML = '<option value="">Seleccione un inflable...</option>';
        
        inflables.forEach(inflable => {
            const option = document.createElement('option');
            option.value = inflable.id;
            option.textContent = `${inflable.nombre} - $${inflable.precio_diario}/día`;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('❌ Error cargando inflables:', error);
    }
}

async function guardarReservaEditada() {
    const reservaId = document.getElementById('edit_reserva_id').value;
    const fechaInicio = document.getElementById('edit_fecha_inicio').value;
    const fechaFin = document.getElementById('edit_fecha_fin').value;
    const clienteId = document.getElementById('edit_cliente_select').value;
    const inflableId = document.getElementById('edit_inflable_select').value;
    const estado = document.getElementById('edit_estado').value;
    const notas = document.getElementById('edit_notas').value;
    
    if (!fechaInicio || !fechaFin || !clienteId || !inflableId) {
        showAlert('Por favor completa todos los campos requeridos', 'warning');
        return;
    }
    
    try {
        const response = await fetch(`/api/reservas/${reservaId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                fecha_inicio: fechaInicio,
                fecha_fin: fechaFin,
                cliente_id: parseInt(clienteId),
                inflable_id: parseInt(inflableId),
                estado: estado,
                notas: notas
            })
        });
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const resultado = await response.json();
        console.log('✅ Reserva actualizada:', resultado);
        
        showAlert('Reserva actualizada exitosamente', 'success');
        
        // Cerrar modal y recargar datos
        const modal = bootstrap.Modal.getInstance(document.getElementById('modalEditarReserva'));
        modal.hide();
        
        loadReservas();
        loadCalendarEvents();
        
    } catch (error) {
        console.error('❌ Error actualizando reserva:', error);
        showAlert('Error actualizando reserva: ' + error.message, 'danger');
    }
}

async function confirmarEliminacionReserva() {
    const reservaId = document.getElementById('edit_reserva_id').value;
    
    if (confirm('¿Está seguro de que desea eliminar esta reserva? Esta acción no se puede deshacer.')) {
        try {
            const response = await fetch(`/api/reservas/${reservaId}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            
            showAlert('Reserva eliminada exitosamente', 'success');
            
            // Cerrar modal y recargar datos
            const modal = bootstrap.Modal.getInstance(document.getElementById('modalEditarReserva'));
            modal.hide();
            
            loadReservas();
            loadCalendarEvents();
            
        } catch (error) {
            console.error('❌ Error eliminando reserva:', error);
            showAlert('Error eliminando reserva: ' + error.message, 'danger');
        }
    }
}

function deleteReserva(id) {
    if (confirm('¿Está seguro de que desea eliminar esta reserva? Esta acción no se puede deshacer.')) {
        // Llamar a la función de eliminación directa
        eliminarReservaDirecta(id);
    }
}

async function eliminarReservaDirecta(id) {
    try {
        const response = await fetch(`/api/reservas/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        showAlert('Reserva eliminada exitosamente', 'success');
        
        // Recargar datos
        loadReservas();
        loadCalendarEvents();
        
    } catch (error) {
        console.error('❌ Error eliminando reserva:', error);
        showAlert('Error eliminando reserva: ' + error.message, 'danger');
    }
}
