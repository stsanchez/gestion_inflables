# Sistema de Gestión de Inflables

Sistema web para la gestión de alquiler de inflables con control de stock, reservas y disponibilidad.

## 🎈 Características

- **Gestión de Inventario**: Administración completa de inflables con imágenes
- **Sistema de Reservas**: Control de fechas y disponibilidad
- **Calendario Visual**: Vista de calendario con reservas
- **Búsqueda de Disponibilidad**: Filtrado por fechas
- **Base de Datos PostgreSQL**: Almacenamiento robusto
- **Interfaz Responsiva**: Diseño moderno con Bootstrap

## 🚀 Tecnologías

- **Backend**: Python Flask
- **Base de Datos**: PostgreSQL
- **Frontend**: HTML, CSS, JavaScript, Bootstrap
- **Calendario**: FullCalendar.js
- **ORM**: SQLAlchemy

## 📋 Requisitos

- Python 3.8+
- PostgreSQL 12+
- pip

## 🛠️ Instalación

1. **Clonar el repositorio**:
   ```bash
   git clone git@github.com:stsanchez/gestion_inflables.git
   cd gestion_inflables
   ```

2. **Instalar dependencias**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Configurar PostgreSQL**:
   - Crear base de datos: `inflables_db`
   - Configurar usuario y contraseña en `app.py`

4. **Ejecutar la aplicación**:
   ```bash
   python app.py
   ```

5. **Acceder a la aplicación**:
   - URL: http://localhost:5001

## 📊 Funcionalidades

### Gestión de Inflables
- ✅ Listado de inflables disponibles
- ✅ Agregar nuevos inflables
- ✅ Editar información y precios
- ✅ Subir imágenes
- ✅ Desactivar inflables (eliminación lógica)

### Sistema de Reservas
- ✅ Crear nuevas reservas
- ✅ Editar reservas existentes
- ✅ Estados: pendiente, confirmada, completada, cancelada
- ✅ Cálculo automático de precios

### Búsqueda y Disponibilidad
- ✅ Filtrado por fechas
- ✅ Vista de inflables disponibles
- ✅ Exclusión de inflables ocupados

### Calendario
- ✅ Vista mensual de reservas
- ✅ Navegación entre meses
- ✅ Eventos con colores por estado

## 🗄️ Estructura de Base de Datos

### Tablas Principales
- `inflable`: Información de inflables
- `cliente`: Datos de clientes
- `reserva`: Reservas y fechas
- `precio`: Historial de precios

## 🔧 Configuración

### Variables de Entorno
Crear archivo `.env` (no incluido en el repositorio):
```
DATABASE_URL=postgresql://usuario:password@localhost:5432/inflables_db
SECRET_KEY=tu_clave_secreta_aqui
```

### Base de Datos
La aplicación creará automáticamente las tablas al ejecutarse por primera vez.

## 📱 Uso

1. **Inventario**: Ver y gestionar inflables
2. **Reservas**: Crear y editar reservas
3. **Calendario**: Vista mensual de reservas
4. **Búsqueda**: Filtrar por disponibilidad

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama para feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 👨‍💻 Autor

**Santiago Sanchez**
- GitHub: [@stsanchez](https://github.com/stsanchez)

## 📞 Soporte

Para soporte, contactar a: [tu-email@ejemplo.com]

---

**Nota**: Este sistema está diseñado para uso en producción con las configuraciones de seguridad apropiadas.