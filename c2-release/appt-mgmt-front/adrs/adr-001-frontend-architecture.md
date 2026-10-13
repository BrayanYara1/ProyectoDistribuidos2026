# ADR 001: Arquitectura Frontend Ligera y Desacoplada

- **Estatus**: Aprobado
- **Fecha**: 2026-03-29
- **Autores**: Equipo de Arquitectura de Sistemas Distribuidos

## Contexto
Se requiere un panel web liviano, de rápido despliegue y sin sobrecarga de build tools pesadas para interactuar con la API Gateway del sistema.

## Decisión
Usar Vanilla HTML5/CSS3/JavaScript modular con una capa de abstracción cliente API (`apiClient.js`) y un contenedor Nginx para servir archivos estáticos eficientemente.

## Consecuencias
- **Positivas**: Carga ultra rápida, compatibilidad universal, costo cero de bundling.
- **Negativas**: Mayor responsabilidad manual en el manejo del estado en el cliente.
