# Pruebas de Calidad y Seguridad - Sprint 11

## 1. Evaluación de Rendimiento (Carga y P95)

Se ha proporcionado un script de **k6** para validar que el percentil 95 (P95) de las consultas clave sea menor a 2 segundos.
Archivo: `backend/tests/load_test.js`

### Cómo ejecutar la prueba
1. Instalar k6 si no está instalado: `choco install k6` (Windows) o `brew install k6` (Mac).
2. Obtener un token JWT válido de un usuario con rol adecuado (ej. ADMIN).
3. Modificar la constante `TOKEN` en `load_test.js` con el valor del JWT.
4. Ejecutar: `k6 run backend/tests/load_test.js`
5. Revisar las métricas de la terminal. El indicador `http_req_duration` debe mostrar `p(95) < 2000`.

## 2. Verificación de Seguridad y Middleware (Errores 401 y 403)

Se crearon rutas específicas en `backend/src/routes/test.routes.js` y están expuestas bajo `/api/v1/test`.
- **401 Unauthorized**: Ocurre cuando no se envía el token o el token es inválido.
- **403 Forbidden**: Ocurre cuando el usuario envía un token válido, pero su rol no le da los privilegios requeridos.

### Casos de prueba manual:
- Habilitar Postman o similar.
- Petición `GET /api/v1/test/401` SIN header `Authorization` -> **Espera HTTP 401**.
- Petición `GET /api/v1/test/403` con un token JWT de rol "BODEGUERO" -> **Espera HTTP 403**.
- Petición `GET /api/v1/test/403` con un token JWT de rol "ADMIN" -> **Espera HTTP 200**.

## 3. Encuesta SUS (System Usability Scale) - Checklist de Aplicación

La encuesta SUS consta de 10 preguntas con una escala Likert del 1 (Totalmente en desacuerdo) al 5 (Totalmente de acuerdo).

### Checklist para ejecutar la encuesta:
- [ ] **Preparación del entorno**: Garantizar que el sistema esté desplegado en un entorno de staging/QA accesible por los evaluadores.
- [ ] **Selección de Evaluadores**: Seleccionar un mínimo de 5 usuarios representativos (ej. 2 Residentes, 1 Bodeguero, 1 Contador, 1 Gerente).
- [ ] **Definición de Escenarios**: Dar a los usuarios tareas específicas del sprint, por ejemplo:
  1. Revisar el dashboard corporativo e intentar generar un PDF.
  2. Verificar los indicadores filtrados en pantalla.
- [ ] **Ejecución de la Evaluación**: No ayudar al usuario a menos que haya un bloqueo técnico; registrar notas sobre la frustración o facilidad observada.
- [ ] **Aplicación del Cuestionario SUS**: Entregar el siguiente cuestionario para que lo evalúen del 1 al 5:
  1. Creo que me gustaría utilizar este sistema frecuentemente.
  2. Encontré el sistema innecesariamente complejo.
  3. Pensé que el sistema era fácil de usar.
  4. Creo que necesitaría el apoyo de una persona técnica para usar este sistema.
  5. Encontré que las diversas funciones del sistema estaban bien integradas.
  6. Pensé que había demasiada inconsistencia en este sistema.
  7. Imagino que la mayoría de las personas aprenderían a usar este sistema muy rápidamente.
  8. Encontré el sistema muy engorroso de usar.
  9. Me sentí muy confiado usando el sistema.
  10. Necesitaba aprender muchas cosas antes de poder empezar con este sistema.
- [ ] **Cálculo de Resultados**: 
  - Para preguntas impares: Restar 1 al puntaje (X - 1).
  - Para preguntas pares: Restar el puntaje a 5 (5 - X).
  - Sumar todo y multiplicar por 2.5.
  - El resultado debe ser **> 68** para considerar que la usabilidad está por encima del promedio.
