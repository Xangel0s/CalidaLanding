#!/usr/bin/env python3
"""
Script de inicio para el servidor de Credicálidda
Instala dependencias y ejecuta el servidor
"""

import subprocess
import sys
import os

def install_requirements():
    """Instalar dependencias de Python"""
    print("📦 Instalando dependencias...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✅ Dependencias instaladas correctamente")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Error instalando dependencias: {e}")
        return False

def start_server():
    """Iniciar el servidor"""
    print("🚀 Iniciando servidor...")
    try:
        subprocess.run([sys.executable, "server.py"])
    except KeyboardInterrupt:
        print("\n👋 Servidor detenido")

def main():
    """Función principal"""
    print("""
🎯 **Credicálidda - Servidor de Desarrollo**
    
Este script instalará las dependencias necesarias y ejecutará el servidor.
    """)
    
    # Verificar si estamos en el directorio correcto
    if not os.path.exists("server.py"):
        print("❌ Error: No se encontró server.py en el directorio actual")
        print("   Asegúrate de ejecutar este script desde el directorio CalidaLanding")
        return
    
    # Instalar dependencias
    if not install_requirements():
        return
    
    # Iniciar servidor
    start_server()

if __name__ == "__main__":
    main()
