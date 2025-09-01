const fetch = require('node-fetch');

exports.handler = async (event) => {
  // Configurar CORS para permitir peticiones desde tu dominio
  const headers = {
    'Access-Control-Allow-Origin': '*', // O tu dominio específico
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Manejar preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    // Verificar que sea una petición POST
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: 'Método no permitido' })
      };
    }

    // Parsear los datos del formulario
    const formData = JSON.parse(event.body);
    
    console.log('📊 Datos recibidos en Netlify Function:', formData);

    // Validar datos requeridos
    if (!formData.nombre || !formData.email || !formData.telefono) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Faltan datos requeridos' })
      };
    }

    // URL de tu Google Apps Script
    const scriptUrl = 'https://script.google.com/macros/s/AKfycbzAL3MqQd9yS0fYJEfUz3wdGu5gHeRtPt1j-1L_4hfYcimYjGfmUx_267Z8P56IWQ2K/exec';

    // Preparar parámetros para Google Sheets
    const params = new URLSearchParams({
      'nombre': formData.nombre,
      'email': formData.email,
      'telefono': formData.telefono,
      'productos': formData.productos || '',
      'total': formData.total || '',
      'mensaje': formData.mensaje || ''
    });

    // Crear URL completa para debugging
    const fullUrl = `${scriptUrl}?${params}`;
    console.log('🔗 URL completa que se enviará:', fullUrl);
    console.log('📝 Parámetros construidos:', params.toString());

    // Enviar datos a Google Sheets
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    console.log('✅ Respuesta de Google Sheets:', response.status);
    console.log('📄 Respuesta completa:', await response.text());

    if (response.ok) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true, 
          message: 'Datos enviados correctamente' 
        })
      };
    } else {
      throw new Error(`Error de Google Sheets: ${response.status}`);
    }

  } catch (error) {
    console.error('❌ Error en Netlify Function:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Error interno del servidor',
        details: error.message 
      })
    };
  }
};
