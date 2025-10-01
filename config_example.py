# Archivo de configuración de ejemplo
# Copia este archivo como 'config.py' y ajusta los valores según tu entorno

# Configuración de la base de datos
DATABASE_CONFIG = {
    'host': 'localhost',
    'port': 5432,
    'database': 'inflables_db',
    'user': 'postgres',
    'password': 'TU_PASSWORD_AQUI'  # Cambiar por tu contraseña real
}

# Clave secreta para Flask (generar una nueva para producción)
SECRET_KEY = 'tu-clave-secreta-aqui'

# Configuración de archivos
UPLOAD_FOLDER = 'static/img'
MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB

# Extensiones permitidas para imágenes
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
