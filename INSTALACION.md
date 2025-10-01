# Guía de Instalación - Sistema de Gestión de Inflables

## 📋 Pasos de Instalación

### 1. Configuración de Base de Datos

1. **Instalar PostgreSQL** (si no está instalado):
   ```bash
   # macOS con Homebrew
   brew install postgresql@15
   
   # Iniciar PostgreSQL
   brew services start postgresql@15
   ```

2. **Crear base de datos**:
   ```bash
   createdb inflables_db
   ```

3. **Configurar usuario** (opcional):
   ```bash
   psql -c "CREATE USER tu_usuario WITH PASSWORD 'tu_password';"
   psql -c "GRANT ALL PRIVILEGES ON DATABASE inflables_db TO tu_usuario;"
   ```

### 2. Configuración del Proyecto

1. **Clonar repositorio**:
   ```bash
   git clone git@github.com:stsanchez/gestion_inflables.git
   cd gestion_inflables
   ```

2. **Crear entorno virtual**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # En Windows: venv\Scripts\activate
   ```

3. **Instalar dependencias**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Configurar base de datos**:
   - Copiar `config_example.py` como `config.py`
   - Editar `config.py` con tus datos de PostgreSQL
   - O editar directamente `app.py` línea 13 con tu configuración

### 3. Ejecutar la Aplicación

1. **Iniciar la aplicación**:
   ```bash
   python app.py
   ```

2. **Acceder a la aplicación**:
   - Abrir navegador en: http://localhost:5001

### 4. Configuración Inicial

1. **Primera ejecución**: La aplicación creará automáticamente las tablas
2. **Datos de prueba**: Se insertarán datos de ejemplo automáticamente
3. **Administración**: Acceder a http://localhost:5001/admin/inflables

## 🔧 Configuración Avanzada

### Variables de Entorno (Recomendado)

Crear archivo `.env`:
```
DATABASE_URL=postgresql://usuario:password@localhost:5432/inflables_db
SECRET_KEY=tu_clave_secreta_muy_larga_y_segura
FLASK_ENV=development
```

### Configuración de Producción

1. **Cambiar SECRET_KEY** por una clave segura
2. **Configurar HTTPS** si es necesario
3. **Usar servidor WSGI** (gunicorn, uwsgi)
4. **Configurar proxy reverso** (nginx)

## 🐛 Solución de Problemas

### Error de Conexión a PostgreSQL
```bash
# Verificar que PostgreSQL esté corriendo
brew services list | grep postgresql

# Reiniciar PostgreSQL
brew services restart postgresql@15
```

### Error de Permisos
```bash
# Dar permisos al usuario
psql -c "ALTER USER postgres CREATEDB;"
```

### Puerto en Uso
```bash
# Cambiar puerto en app.py línea 485
app.run(debug=True, port=5002)  # Cambiar 5001 por 5002
```

## 📞 Soporte

Si tienes problemas con la instalación:
1. Verificar que PostgreSQL esté corriendo
2. Verificar credenciales de base de datos
3. Verificar que el puerto 5001 esté libre
4. Revisar logs de la aplicación en la consola
