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

El *System Usability Scale* (SUS), propuesto por Brooke (1996), es un cuestionario estandarizado que permite evaluar la usabilidad percibida de un sistema. Está compuesto por 10 afirmaciones valoradas mediante una escala Likert de cinco niveles, alternando afirmaciones positivas y negativas. Su aplicación genera una puntuación global de 0 a 100 puntos, donde los valores más altos representan una percepción más favorable de usabilidad.

En el proyecto ICARO, este instrumento se utilizará para evaluar la percepción de los usuarios sobre la interacción con las funcionalidades del sistema web y móvil. De acuerdo con el anteproyecto aprobado, se establece como criterio de aceptación una **puntuación media SUS ≥ 75 puntos**.

### Checklist para ejecutar la encuesta:

- [ ] **Preparación del entorno:** Garantizar que el sistema ICARO se encuentre desplegado y accesible en un ambiente de pruebas o staging/QA. Verificar el funcionamiento de los módulos que serán evaluados, la disponibilidad de los datos de prueba y la configuración de los permisos correspondientes a cada perfil.

- [ ] **Selección de participantes:** Considerar la población de 10 usuarios clave identificada en el anteproyecto aprobado, verificando su disponibilidad, funciones y relación con los procesos evaluados. Se deberán incluir perfiles representativos de las actividades técnicas, administrativas y contables, según corresponda. Si participan todos los integrantes de la población delimitada, se documentará un censo; en caso contrario, se justificará la selección y el número de participantes.

- [ ] **Identificación y confidencialidad:** Asignar un código anónimo a cada participante (por ejemplo, P01, P02 y P03), sin registrar nombres o información personal innecesaria en los resultados. Documentar su perfil, el tipo de dispositivo utilizado y las condiciones de aplicación. Informar a cada participante sobre la finalidad de la evaluación y obtener su consentimiento cuando corresponda.

- [ ] **Definición de escenarios:** Seleccionar tareas representativas de los procesos implementados en ICARO. Las actividades deberán asignarse de acuerdo con el perfil y los permisos del participante, verificando previamente su funcionamiento en el entorno de evaluación.

  **Escenarios propuestos:**

  1. **T-US-01 — Administración:** Acceder al sistema y localizar las funciones de administración de usuarios.
  2. **T-US-02 — Avances de obra:** Registrar un avance físico, incluyendo la información y evidencia solicitadas por el sistema.
  3. **T-US-03 — Consumo de materiales:** Registrar un consumo de materiales y consultar su estado o historial correspondiente.
  4. **T-US-04 — Bodega e inventario:** Consultar los materiales disponibles y registrar la recepción de un requerimiento aprobado.
  5. **T-US-05 — Contabilidad:** Consultar una consolidación mensual y revisar las validaciones previas al cierre contable.
  6. **T-US-06 — Reportes gerenciales:** Acceder al dashboard, seleccionar un proyecto o periodo y consultar los indicadores presentados.

  **Nota:** Los escenarios representan actividades candidatas identificadas a partir de los módulos del repositorio. Su selección definitiva requiere verificar los permisos, los datos necesarios y el funcionamiento de cada flujo. Los códigos T-US-01 a T-US-06 son identificadores propuestos para el protocolo de usabilidad.

- [ ] **Ejecución de la evaluación:** Solicitar a los participantes que realicen las tareas asignadas sin proporcionar instrucciones sobre cómo resolverlas. Registrar las tareas completadas, dificultades de navegación, errores de interacción y situaciones que impidan continuar. La asistencia únicamente deberá proporcionarse cuando exista un bloqueo que imposibilite la ejecución, dejando constancia de la intervención.

- [ ] **Registro del desempeño:** Utilizar una ficha de observación para registrar el código del participante, escenario evaluado, resultado esperado, resultado obtenido y cumplimiento de la tarea. Esta información permitirá calcular la tasa de éxito como medida complementaria de usabilidad.

- [ ] **Aplicación del cuestionario SUS:** Una vez finalizadas las tareas representativas, entregar el cuestionario de 10 afirmaciones. Cada participante deberá valorar su experiencia general de utilización del sistema ICARO mediante la siguiente escala:

  **Escala de respuesta:**

  - **1:** Totalmente en desacuerdo.
  - **2:** En desacuerdo.
  - **3:** Ni de acuerdo ni en desacuerdo.
  - **4:** De acuerdo.
  - **5:** Totalmente de acuerdo.

  **Afirmaciones del cuestionario:**

  1. Me gustaría utilizar el sistema ICARO con frecuencia.
  2. Considero que el sistema ICARO es innecesariamente complejo.
  3. Me resultó fácil utilizar el sistema ICARO.
  4. Creo que necesitaría ayuda de una persona con conocimientos técnicos para poder utilizar el sistema ICARO.
  5. Considero que las diferentes funciones del sistema ICARO están bien integradas.
  6. Considero que existen demasiadas inconsistencias en el sistema ICARO.
  7. Creo que la mayoría de las personas aprendería a utilizar el sistema ICARO rápidamente.
  8. Me resultó engorroso utilizar el sistema ICARO.
  9. Me sentí confiado al utilizar el sistema ICARO.
  10. Necesité aprender muchas cosas antes de poder comenzar a utilizar el sistema ICARO.

  **Nota metodológica:** Estas afirmaciones mantienen el sentido y el orden de los diez ítems del SUS y constituyen una propuesta de armonización lingüística para ICARO. Antes de aplicar el cuestionario, se deberá cotejar la redacción con una traducción española validada y documentar la versión definitiva utilizada. No se deben añadir preguntas específicas de los módulos dentro de la puntuación SUS.

- [ ] **Cálculo de resultados:** Registrar las respuestas válidas en la hoja `SUS_CAPTURA` del archivo `02_Matriz_Operacionalizacion_Variables_ICARO.xlsx` y aplicar el procedimiento de puntuación original de Brooke (1996).

  **Cálculo de la puntuación individual:**

  - Para los ítems impares (1, 3, 5, 7 y 9), restar 1 al valor seleccionado: `X - 1`.
  - Para los ítems pares (2, 4, 6, 8 y 10), restar el valor seleccionado a 5: `5 - X`.
  - Sumar las diez contribuciones ajustadas.
  - Multiplicar el resultado por 2,5 para obtener una puntuación individual entre 0 y 100 puntos.

  **Fórmula de puntuación individual:**

  `SUS_j = 2,5 × [Σ(X_impares - 1) + Σ(5 - X_pares)]`

  **Cálculo de la puntuación media:**

  Sumar las puntuaciones SUS individuales y dividirlas entre el número de participantes con respuestas válidas.

  `SUS_media = Σ(SUS_j) / m`

  Donde `m` representa el número de participantes con cuestionarios válidos.

  **Criterio de aceptación establecido para ICARO:**

  - **SUS medio ≥ 75 puntos:** Cumple el criterio aprobado.
  - **SUS medio < 75 puntos:** No cumple el criterio aprobado.
  - **Sin respuestas válidas suficientes para la evaluación definida:** No se emite un dictamen de cumplimiento.

  El valor de 68 puntos puede utilizarse como referencia comparativa de la literatura, pero no reemplaza el umbral de aceptación de 75 puntos establecido en el anteproyecto.

- [ ] **Análisis complementario de tareas:** Calcular la tasa de éxito de los intentos de tarea mediante la siguiente expresión:

  `TE = (Tareas completadas correctamente / Total de intentos evaluados) × 100`

  Esta medida describe el cumplimiento de las actividades asignadas y complementa la percepción obtenida mediante SUS. No se establecerá un dictamen de cumplimiento para la tasa de éxito mientras no exista un umbral previamente definido y justificado.

- [ ] **Registro y conservación de evidencias:** Conservar los cuestionarios respondidos, las fichas de observación, el registro de participantes codificados, los resultados de cálculo y la identificación del entorno de evaluación. Los documentos deberán mantener la confidencialidad de la información de la empresa y permitir la trazabilidad de los resultados.

- [ ] **Interpretación de resultados:** Comparar la puntuación media SUS con el criterio aprobado de 75 puntos y describir la variabilidad de las puntuaciones individuales. Los resultados deberán interpretarse considerando la cantidad de participantes, los perfiles evaluados, las tareas realizadas y las condiciones del entorno. Si se evalúan conjuntos distintos de módulos o dispositivos, estas diferencias deberán quedar documentadas.

- [ ] **Documentación de la evaluación:** Incorporar el procedimiento de aplicación en el apartado 3.5.4 del marco metodológico, la población y unidades de análisis en el apartado 3.4, los indicadores y criterios en el apartado 3.3, y las técnicas de procesamiento estadístico en el apartado 3.7. Los resultados obtenidos se presentarán en el capítulo correspondiente.

### Referencias e instrumentos relacionados

- **Brooke (1996):** System Usability Scale (SUS), instrumento original de evaluación de usabilidad percibida.
- **ISO/IEC 25010:2023:** Modelo de calidad del producto software, incluyendo la característica de capacidad de interacción.
- **ISO/IEC 25019:2023:** Modelo de calidad en uso.
- **Anteproyecto aprobado de ICARO:** Objetivo específico de evaluación de usabilidad y criterio de aceptación SUS ≥ 75 puntos.
- **`02_Matriz_Operacionalizacion_Variables_ICARO.xlsx`:** Matriz de indicadores y hoja de captura de respuestas SUS.
- **`03_Plan_Verificacion_Criterios_Aceptacion_ICARO.xlsx`:** Registro de umbrales, reglas de decisión y evidencias de cumplimiento.

**Estado de aplicación:** Pendiente de ejecución y registro de resultados verificables. La existencia del cuestionario y de los escenarios propuestos no constituye evidencia de que la evaluación haya sido realizada.


