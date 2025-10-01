#!/usr/bin/env python3
"""
Script para poblar la base de datos con datos de prueba
"""

from app import app, db, Inflable, Cliente, Reserva
from datetime import datetime, date, timedelta
import random

def create_sample_data():
    with app.app_context():
        # Limpiar datos existentes
        db.drop_all()
        db.create_all()
        
        # Crear inflables de muestra
        inflables_data = [
            {
                'nombre': 'Castillo Medieval',
                'descripcion': 'Castillo inflable de 3x3 metros, ideal para fiestas infantiles',
                'precio_diario': 150.00,
                'imagen_url': '/static/img/castillo_medieval.png'
            },
            {
                'nombre': 'Tobogán Acuático',
                'descripcion': 'Tobogán inflable con piscina, perfecto para el verano',
                'precio_diario': 200.00,
                'imagen_url': '/static/img/tobogan_acuatico.png'
            },
            {
                'nombre': 'Pista de Obstáculos',
                'descripcion': 'Pista inflable con obstáculos para competencias',
                'precio_diario': 180.00,
                'imagen_url': '/static/img/pista_obstaculos.png'
            },
            {
                'nombre': 'Casa de Saltos',
                'descripcion': 'Casa inflable con múltiples compartimentos',
                'precio_diario': 120.00,
                'imagen_url': '/static/img/casa_saltos.png'
            },
            {
                'nombre': 'Toro Mecánico',
                'descripcion': 'Toro inflable para adultos y adolescentes',
                'precio_diario': 250.00,
                'imagen_url': '/static/img/toro_mecanico.png'
            },
            {
                'nombre': 'Pista de Baile',
                'descripcion': 'Pista inflable para eventos y fiestas',
                'precio_diario': 300.00,
                'imagen_url': '/static/img/pista_baile.png'
            },
            {
                'nombre': 'Laberinto de Aventuras',
                'descripcion': 'Laberinto inflable con múltiples niveles',
                'precio_diario': 220.00,
                'imagen_url': '/static/img/laberinto_aventuras.png'
            },
            {
                'nombre': 'Pista de Fútbol',
                'descripcion': 'Pista inflable para partidos de fútbol',
                'precio_diario': 280.00,
                'imagen_url': '/static/img/pista_futbol.png'
            }
        ]
        
        inflables = []
        for data in inflables_data:
            inflable = Inflable(**data)
            db.session.add(inflable)
            inflables.append(inflable)
        
        db.session.commit()
        print(f"✅ Creados {len(inflables)} inflables")
        
        # Crear clientes de muestra
        clientes_data = [
            {
                'nombre': 'María González',
                'telefono': '+54 11 1234-5678',
                'email': 'maria.gonzalez@email.com',
                'direccion': 'Av. Corrientes 1234, CABA'
            },
            {
                'nombre': 'Carlos Rodríguez',
                'telefono': '+54 11 2345-6789',
                'email': 'carlos.rodriguez@email.com',
                'direccion': 'Av. Santa Fe 5678, CABA'
            },
            {
                'nombre': 'Ana Martínez',
                'telefono': '+54 11 3456-7890',
                'email': 'ana.martinez@email.com',
                'direccion': 'Av. Rivadavia 9012, CABA'
            },
            {
                'nombre': 'Luis Fernández',
                'telefono': '+54 11 4567-8901',
                'email': 'luis.fernandez@email.com',
                'direccion': 'Av. Córdoba 3456, CABA'
            },
            {
                'nombre': 'Sofia López',
                'telefono': '+54 11 5678-9012',
                'email': 'sofia.lopez@email.com',
                'direccion': 'Av. Callao 7890, CABA'
            }
        ]
        
        clientes = []
        for data in clientes_data:
            cliente = Cliente(**data)
            db.session.add(cliente)
            clientes.append(cliente)
        
        db.session.commit()
        print(f"✅ Creados {len(clientes)} clientes")
        
        # Crear reservas de muestra
        reservas_data = []
        hoy = date.today()
        
        # Reservas pasadas
        for i in range(5):
            fecha_inicio = hoy - timedelta(days=random.randint(10, 30))
            fecha_fin = fecha_inicio + timedelta(days=random.randint(1, 3))
            inflable = random.choice(inflables)
            cliente = random.choice(clientes)
            dias = (fecha_fin - fecha_inicio).days + 1
            precio_total = inflable.precio_diario * dias
            
            reserva = Reserva(
                inflable_id=inflable.id,
                cliente_id=cliente.id,
                fecha_inicio=fecha_inicio,
                fecha_fin=fecha_fin,
                precio_total=precio_total,
                estado='completada',
                notas=f'Reserva completada - {random.choice(["Excelente servicio", "Muy satisfecho", "Recomendado"])}'
            )
            reservas_data.append(reserva)
        
        # Reservas actuales/futuras
        for i in range(8):
            fecha_inicio = hoy + timedelta(days=random.randint(1, 15))
            fecha_fin = fecha_inicio + timedelta(days=random.randint(1, 4))
            inflable = random.choice(inflables)
            cliente = random.choice(clientes)
            dias = (fecha_fin - fecha_inicio).days + 1
            precio_total = inflable.precio_diario * dias
            
            reserva = Reserva(
                inflable_id=inflable.id,
                cliente_id=cliente.id,
                fecha_inicio=fecha_inicio,
                fecha_fin=fecha_fin,
                precio_total=precio_total,
                estado=random.choice(['pendiente', 'confirmada']),
                notas=f'Reserva {random.choice(["para cumpleaños", "evento corporativo", "fiesta familiar"])}'
            )
            reservas_data.append(reserva)
        
        for reserva in reservas_data:
            db.session.add(reserva)
        
        db.session.commit()
        print(f"✅ Creadas {len(reservas_data)} reservas")
        
        print("\n🎉 Base de datos poblada exitosamente!")
        print("\nDatos creados:")
        print(f"- {len(inflables)} inflables")
        print(f"- {len(clientes)} clientes")
        print(f"- {len(reservas_data)} reservas")
        print("\nPuedes iniciar la aplicación con: python app.py")

if __name__ == '__main__':
    create_sample_data()
