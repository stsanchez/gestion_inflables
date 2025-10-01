from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from datetime import datetime, date
from dateutil.parser import parse as parse_date
import os
import uuid
from werkzeug.utils import secure_filename

app = Flask(__name__)
app.config['SECRET_KEY'] = 'tu-clave-secreta-aqui'
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:TU_PASSWORD_AQUI@localhost:5432/inflables_db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = 'static/img'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

db = SQLAlchemy(app)
migrate = Migrate(app, db)
CORS(app)

# Funciones auxiliares para manejo de archivos
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def save_uploaded_file(file, inflable_name):
    if file and allowed_file(file.filename):
        # Crear nombre de archivo seguro basado en el nombre del inflable
        safe_name = secure_filename(inflable_name.lower().replace(' ', '_').replace('á', 'a').replace('é', 'e').replace('í', 'i').replace('ó', 'o').replace('ú', 'u'))
        file_extension = file.filename.rsplit('.', 1)[1].lower()
        filename = f"{safe_name}.{file_extension}"
        
        # Si el archivo ya existe, agregar un UUID
        if os.path.exists(os.path.join(app.config['UPLOAD_FOLDER'], filename)):
            unique_id = str(uuid.uuid4())[:8]
            filename = f"{safe_name}_{unique_id}.{file_extension}"
        
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        return f"/static/img/{filename}"
    return None

# Modelos de base de datos
class Inflable(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    descripcion = db.Column(db.Text)
    precio_diario = db.Column(db.Float, nullable=False)
    imagen_url = db.Column(db.String(255), nullable=True)
    activo = db.Column(db.Boolean, default=True)
    reservas = db.relationship('Reserva', backref='inflable', lazy=True)

class Cliente(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    telefono = db.Column(db.String(20))
    email = db.Column(db.String(100))
    direccion = db.Column(db.Text)
    reservas = db.relationship('Reserva', backref='cliente', lazy=True)

class Reserva(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    inflable_id = db.Column(db.Integer, db.ForeignKey('inflable.id'), nullable=False)
    cliente_id = db.Column(db.Integer, db.ForeignKey('cliente.id'), nullable=False)
    fecha_inicio = db.Column(db.Date, nullable=False)
    fecha_fin = db.Column(db.Date, nullable=False)
    precio_total = db.Column(db.Float, nullable=False)
    estado = db.Column(db.String(20), default='pendiente')  # pendiente, confirmada, completada, cancelada
    notas = db.Column(db.Text)
    fecha_creacion = db.Column(db.DateTime, default=datetime.utcnow)

# Rutas principales
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/admin/inflables')
def admin_inflables():
    return render_template('admin_inflables.html')

# API para inflables
@app.route('/api/clientes', methods=['GET'])
def get_clientes():
    """Obtener todos los clientes"""
    try:
        clientes = Cliente.query.all()
        return jsonify([{
            'id': c.id,
            'nombre': c.nombre,
            'telefono': c.telefono,
            'email': c.email,
            'direccion': c.direccion
        } for c in clientes])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/inflables', methods=['GET'])
def get_inflables():
    try:
        print("🔍 Consultando inflables desde PostgreSQL...")
        inflables = Inflable.query.filter(Inflable.activo != False).all()
        print(f"📦 Encontrados {len(inflables)} inflables")
        
        result = [{
            'id': i.id,
            'nombre': i.nombre,
            'descripcion': i.descripcion,
            'precio_diario': i.precio_diario,
            'imagen_url': i.imagen_url,
            'activo': i.activo
        } for i in inflables]
        
        print(f"✅ Devolviendo {len(result)} inflables")
        return jsonify(result)
    except Exception as e:
        print(f"❌ Error en get_inflables: {e}")
        return jsonify([])

@app.route('/api/inflables/admin', methods=['GET'])
def get_inflables_admin():
    """API para administración - devuelve todos los inflables (activos e inactivos)"""
    try:
        print("🔍 Consultando inflables para administración...")
        inflables = Inflable.query.all()
        print(f"📦 Encontrados {len(inflables)} inflables (todos)")
        
        result = [{
            'id': i.id,
            'nombre': i.nombre,
            'descripcion': i.descripcion,
            'precio_diario': i.precio_diario,
            'imagen_url': i.imagen_url,
            'activo': i.activo
        } for i in inflables]
        
        print(f"✅ Devolviendo {len(result)} inflables para administración")
        return jsonify(result)
    except Exception as e:
        print(f"❌ Error consultando inflables para administración: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/inflables', methods=['POST'])
def create_inflable():
    # Verificar si hay archivo subido
    if 'imagen' in request.files:
        # Manejar subida de archivo
        file = request.files['imagen']
        nombre = request.form.get('nombre')
        descripcion = request.form.get('descripcion', '')
        precio_diario = float(request.form.get('precio_diario'))
        
        # Guardar archivo y obtener ruta
        imagen_url = save_uploaded_file(file, nombre)
        
        inflable = Inflable(
            nombre=nombre,
            descripcion=descripcion,
            precio_diario=precio_diario,
            imagen_url=imagen_url
        )
    else:
        # Manejar datos JSON (sin archivo)
        data = request.json
        inflable = Inflable(
            nombre=data['nombre'],
            descripcion=data.get('descripcion', ''),
            precio_diario=data['precio_diario'],
            imagen_url=data.get('imagen_url', '')
        )
    
    db.session.add(inflable)
    db.session.commit()
    return jsonify({'id': inflable.id, 'message': 'Inflable creado exitosamente'})

# API para disponibilidad
@app.route('/api/disponibilidad', methods=['GET'])
def get_disponibilidad():
    fecha_inicio = request.args.get('fecha_inicio')
    fecha_fin = request.args.get('fecha_fin')
    
    if not fecha_inicio or not fecha_fin:
        return jsonify({'error': 'Fechas requeridas'}), 400
    
    try:
        fecha_inicio = parse_date(fecha_inicio).date()
        fecha_fin = parse_date(fecha_fin).date()
    except:
        return jsonify({'error': 'Formato de fecha inválido'}), 400
    
    # Obtener inflables ocupados en esas fechas
    # La lógica correcta: una reserva está ocupada si:
    # - La reserva empieza antes o en la fecha_fin Y
    # - La reserva termina después o en la fecha_inicio
    inflables_ocupados = db.session.query(Reserva.inflable_id).filter(
        Reserva.estado.in_(['pendiente', 'confirmada']),
        Reserva.fecha_inicio <= fecha_fin,
        Reserva.fecha_fin >= fecha_inicio
    ).all()
    
    ocupados_ids = [r[0] for r in inflables_ocupados]
    
    # Obtener inflables disponibles
    if ocupados_ids:
        inflables_disponibles = Inflable.query.filter(
            Inflable.activo == True,
            ~Inflable.id.in_(ocupados_ids)
        ).all()
    else:
        inflables_disponibles = Inflable.query.filter(
            Inflable.activo == True
        ).all()
    
    return jsonify([{
        'id': i.id,
        'nombre': i.nombre,
        'descripcion': i.descripcion,
        'precio_diario': i.precio_diario,
        'imagen_url': i.imagen_url
    } for i in inflables_disponibles])

# API para reservas
@app.route('/api/reservas', methods=['GET'])
def get_reservas():
    reservas = Reserva.query.join(Inflable).join(Cliente).all()
    return jsonify([{
        'id': r.id,
        'inflable': r.inflable.nombre,
        'cliente': r.cliente.nombre,
        'fecha_inicio': r.fecha_inicio.isoformat(),
        'fecha_fin': r.fecha_fin.isoformat(),
        'precio_total': r.precio_total,
        'estado': r.estado,
        'notas': r.notas
    } for r in reservas])

@app.route('/api/reservas', methods=['POST'])
def create_reserva():
    data = request.json
    
    # Verificar disponibilidad
    fecha_inicio = parse_date(data['fecha_inicio']).date()
    fecha_fin = parse_date(data['fecha_fin']).date()
    
    # Verificar si el inflable está disponible
    conflicto = Reserva.query.filter(
        Reserva.inflable_id == data['inflable_id'],
        Reserva.estado.in_(['pendiente', 'confirmada']),
        Reserva.fecha_inicio <= fecha_fin,
        Reserva.fecha_fin >= fecha_inicio
    ).first()
    
    if conflicto:
        return jsonify({'error': 'El inflable no está disponible en esas fechas'}), 400
    
    # Crear o encontrar cliente
    cliente = Cliente.query.filter_by(telefono=data['cliente']['telefono']).first()
    if not cliente:
        cliente = Cliente(
            nombre=data['cliente']['nombre'],
            telefono=data['cliente']['telefono'],
            email=data['cliente'].get('email', ''),
            direccion=data['cliente'].get('direccion', '')
        )
        db.session.add(cliente)
        db.session.flush()
    
    # Calcular precio total
    inflable = Inflable.query.get(data['inflable_id'])
    dias = (fecha_fin - fecha_inicio).days + 1
    precio_total = inflable.precio_diario * dias
    
    # Crear reserva
    reserva = Reserva(
        inflable_id=data['inflable_id'],
        cliente_id=cliente.id,
        fecha_inicio=fecha_inicio,
        fecha_fin=fecha_fin,
        precio_total=precio_total,
        notas=data.get('notas', '')
    )
    
    db.session.add(reserva)
    db.session.commit()
    
    return jsonify({'id': reserva.id, 'message': 'Reserva creada exitosamente'})

# API para calendario
@app.route('/api/calendario', methods=['GET'])
def get_calendario():
    mes = request.args.get('mes', datetime.now().month)
    año = request.args.get('año', datetime.now().year)
    
    # Obtener todas las reservas del mes
    reservas = Reserva.query.filter(
        Reserva.estado.in_(['pendiente', 'confirmada']),
        db.extract('month', Reserva.fecha_inicio) == int(mes),
        db.extract('year', Reserva.fecha_inicio) == int(año)
    ).all()
    
    eventos = []
    for reserva in reservas:
        eventos.append({
            'id': reserva.id,
            'title': f"{reserva.inflable.nombre} - {reserva.cliente.nombre}",
            'start': reserva.fecha_inicio.isoformat(),
            'end': reserva.fecha_fin.isoformat(),
            'color': '#ff6b6b' if reserva.estado == 'pendiente' else '#51cf66'
        })
    
    return jsonify(eventos)

# API para detalles de inflable
@app.route('/api/inflables/<int:inflable_id>/reservas', methods=['GET'])
def get_inflable_reservas(inflable_id):
    tipo = request.args.get('tipo', 'proximas')  # proximas o historial
    
    if tipo == 'proximas':
        # Reservas futuras y actuales
        reservas = Reserva.query.filter(
            Reserva.inflable_id == inflable_id,
            Reserva.estado.in_(['pendiente', 'confirmada']),
            Reserva.fecha_inicio >= date.today()
        ).order_by(Reserva.fecha_inicio.asc()).all()
    else:
        # Historial de reservas completadas
        reservas = Reserva.query.filter(
            Reserva.inflable_id == inflable_id,
            Reserva.estado == 'completada'
        ).order_by(Reserva.fecha_inicio.desc()).all()
    
    return jsonify([{
        'id': r.id,
        'cliente': r.cliente.nombre if r.cliente else 'Cliente no encontrado',
        'telefono': r.cliente.telefono if r.cliente else '',
        'email': r.cliente.email if r.cliente else '',
        'fecha_inicio': r.fecha_inicio.isoformat() if r.fecha_inicio else None,
        'fecha_fin': r.fecha_fin.isoformat() if r.fecha_fin else None,
        'precio_total': r.precio_total,
        'estado': r.estado,
        'notas': r.notas,
        'fecha_creacion': r.fecha_creacion.isoformat() if r.fecha_creacion else None
    } for r in reservas])

# APIs de administración de inflables
@app.route('/api/inflables/<int:inflable_id>', methods=['PUT'])
def update_inflable(inflable_id):
    """Actualizar un inflable existente"""
    try:
        inflable = Inflable.query.get_or_404(inflable_id)
        
        # Verificar si hay archivo subido
        if 'imagen' in request.files and request.files['imagen'].filename:
            # Procesar nueva imagen
            archivo = request.files['imagen']
            if archivo and allowed_file(archivo.filename):
                # Eliminar imagen anterior si existe
                if inflable.imagen_url:
                    ruta_anterior = os.path.join(app.root_path, 'static', inflable.imagen_url.lstrip('/'))
                    if os.path.exists(ruta_anterior):
                        os.remove(ruta_anterior)
                
                # Guardar nueva imagen
                imagen_url = save_uploaded_file(archivo)
                inflable.imagen_url = imagen_url
        
        # Actualizar otros campos
        inflable.nombre = request.form.get('nombre', inflable.nombre)
        inflable.descripcion = request.form.get('descripcion', inflable.descripcion)
        inflable.precio_diario = float(request.form.get('precio_diario', inflable.precio_diario))
        
        db.session.commit()
        return jsonify({'message': 'Inflable actualizado exitosamente', 'inflable': {
            'id': inflable.id,
            'nombre': inflable.nombre,
            'descripcion': inflable.descripcion,
            'precio_diario': inflable.precio_diario,
            'imagen_url': inflable.imagen_url
        }})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/inflables/<int:inflable_id>/desactivar', methods=['POST'])
def desactivar_inflable(inflable_id):
    """Desactivar un inflable (marcar como inactivo)"""
    try:
        inflable = Inflable.query.get_or_404(inflable_id)
        inflable.activo = False
        db.session.commit()
        return jsonify({'message': 'Inflable desactivado exitosamente'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/inflables/<int:inflable_id>/reactivar', methods=['POST'])
def reactivar_inflable(inflable_id):
    """Reactivar un inflable (marcar como activo)"""
    try:
        inflable = Inflable.query.get_or_404(inflable_id)
        inflable.activo = True
        db.session.commit()
        return jsonify({'message': 'Inflable reactivado exitosamente'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# APIs para editar reservas
@app.route('/api/reservas/<int:reserva_id>', methods=['PUT'])
def update_reserva(reserva_id):
    """Actualizar una reserva existente"""
    try:
        reserva = Reserva.query.get_or_404(reserva_id)
        data = request.get_json()
        
        # Actualizar campos
        if 'fecha_inicio' in data:
            reserva.fecha_inicio = datetime.strptime(data['fecha_inicio'], '%Y-%m-%d').date()
        if 'fecha_fin' in data:
            reserva.fecha_fin = datetime.strptime(data['fecha_fin'], '%Y-%m-%d').date()
        if 'cliente_id' in data:
            reserva.cliente_id = data['cliente_id']
        if 'inflable_id' in data:
            reserva.inflable_id = data['inflable_id']
        if 'estado' in data:
            reserva.estado = data['estado']
        if 'notas' in data:
            reserva.notas = data['notas']
        
        # Recalcular precio total
        if 'fecha_inicio' in data or 'fecha_fin' in data or 'inflable_id' in data:
            dias = (reserva.fecha_fin - reserva.fecha_inicio).days + 1
            reserva.precio_total = reserva.inflable.precio_diario * dias
        
        db.session.commit()
        
        return jsonify({
            'message': 'Reserva actualizada exitosamente',
            'reserva': {
                'id': reserva.id,
                'fecha_inicio': reserva.fecha_inicio.isoformat(),
                'fecha_fin': reserva.fecha_fin.isoformat(),
                'cliente_id': reserva.cliente_id,
                'inflable_id': reserva.inflable_id,
                'precio_total': reserva.precio_total,
                'estado': reserva.estado,
                'notas': reserva.notas
            }
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/reservas/<int:reserva_id>', methods=['GET'])
def get_reserva(reserva_id):
    """Obtener una reserva específica"""
    try:
        reserva = Reserva.query.get_or_404(reserva_id)
        return jsonify({
            'id': reserva.id,
            'fecha_inicio': reserva.fecha_inicio.isoformat() if reserva.fecha_inicio else None,
            'fecha_fin': reserva.fecha_fin.isoformat() if reserva.fecha_fin else None,
            'cliente_id': reserva.cliente_id,
            'inflable_id': reserva.inflable_id,
            'precio_total': reserva.precio_total,
            'estado': reserva.estado,
            'notas': reserva.notas,
            'fecha_creacion': reserva.fecha_creacion.isoformat() if reserva.fecha_creacion else None
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/reservas/<int:reserva_id>', methods=['DELETE'])
def delete_reserva(reserva_id):
    """Eliminar una reserva"""
    try:
        reserva = Reserva.query.get_or_404(reserva_id)
        db.session.delete(reserva)
        db.session.commit()
        return jsonify({'message': 'Reserva eliminada exitosamente'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5001)
