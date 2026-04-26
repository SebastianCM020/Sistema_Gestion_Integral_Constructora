<#
    generate_arch_v2.ps1
    Genera Arquitectura_Sistema_ICARO_v2.docx basándose en el documento original V1.
    Abre Word COM automation, copia el archivo, aplica correcciones y agrega nuevas secciones.
    REQUISITO: Microsoft Word instalado.
#>

$ErrorActionPreference = 'Stop'

$docsPath = "C:\Users\Hp\Desktop\Sistema_Gestion_Integral_Constructora\docs"
$v1Path   = Join-Path $docsPath "Arquitectura V1.docx"
$v2Path   = Join-Path $docsPath "Arquitectura_Sistema_ICARO_v2.docx"

# ------------------------------------------------------------------
# 1. Copiar V1 como base de V2 (preserva todas las imágenes)
# ------------------------------------------------------------------
Write-Host "`n[1/6] Copiando Arquitectura V1.docx → Arquitectura_Sistema_ICARO_v2.docx ..."
Copy-Item -Path $v1Path -Destination $v2Path -Force
Write-Host "      Copia creada: $v2Path"

# ------------------------------------------------------------------
# 2. Abrir Word COM
# ------------------------------------------------------------------
Write-Host "`n[2/6] Iniciando Microsoft Word COM ..."
try {
    $word = New-Object -ComObject Word.Application
    $word.Visible = $false
} catch {
    Write-Error "ERROR: No se pudo iniciar Microsoft Word. Verifique que Word esté instalado.`n$_"
    exit 1
}

try {
    $doc = $word.Documents.Open($v2Path)
    Write-Host "      Documento abierto."

    # ------------------------------------------------------------------
    # 3. Find & Replace: unificar nombre de la empresa (INC-FOR-02)
    # ------------------------------------------------------------------
    Write-Host "`n[3/6] Aplicando Find & Replace para unificar nombre empresa (INC-FOR-02) ..."

    $find = $doc.Content.Find
    $find.ClearFormatting()

    $replacements = @(
        @{ Old = "ICAROCONSTRUCTORES BMGM S.A.S";     New = "ICARO CONSTRUCTORES BMGM S.A.S." }
        @{ Old = "ICAROCONSTRUCTORES BMGM S.A.S.";    New = "ICARO CONSTRUCTORES BMGM S.A.S." }
        @{ Old = "ICARO CONSTRUCTORES BMGM S.A.S";    New = "ICARO CONSTRUCTORES BMGM S.A.S." }   # sin punto final
        @{ Old = "CONSTRUCTORES BMGM S.A.S.";         New = "ICARO CONSTRUCTORES BMGM S.A.S." }
        @{ Old = "CONSTRUCTORES BMGM S.A.S";          New = "ICARO CONSTRUCTORES BMGM S.A.S." }
    )

    $wdReplaceAll = 2
    foreach ($r in $replacements) {
        $find.Text = $r.Old
        $find.Replacement.Text = $r.New
        $find.Execute($null,$null,$null,$null,$null,$null,$true,$null,$null,$null,$wdReplaceAll) | Out-Null
        Write-Host "      Reemplazado: '$($r.Old)' → '$($r.New)'"
    }

    # ------------------------------------------------------------------
    # 4. Actualizar título en el encabezado del documento (portada)
    # ------------------------------------------------------------------
    Write-Host "`n[4/6] Actualizando versión en portada ..."
    $find2 = $doc.Content.Find
    $find2.ClearFormatting()
    $versionReplace = @(
        @{ Old = "Versión: 1.0";  New = "Versión: 2.0" }
        @{ Old = "Versión 1.0";   New = "Versión 2.0" }
        @{ Old = "7/04/2026";     New = "25/04/2026" }
    )
    foreach ($r in $versionReplace) {
        $find2.Text = $r.Old
        $find2.Replacement.Text = $r.New
        $find2.Execute($null,$null,$null,$null,$null,$null,$true,$null,$null,$null,$wdReplaceAll) | Out-Null
    }

    # ------------------------------------------------------------------
    # 5. Ir al final del documento y agregar nuevas secciones v2
    # ------------------------------------------------------------------
    Write-Host "`n[5/6] Agregando nuevas secciones v2 al final del documento ..."

    # Helper: agregar párrafo con estilo
    function Add-Para ($doc, $text, $style) {
        $para = $doc.Content.Paragraphs.Add()
        $para.Range.Text = $text
        try { $para.Style = $doc.Styles.Item($style) } catch {}
        $para.Range.InsertParagraphAfter() | Out-Null
        return $para
    }

    # Mover cursor al final
    $sel = $word.Selection
    $sel.EndKey(6) | Out-Null   # 6 = wdStory

    # ---------- Separador de inicio v2 ----------
    $sel.TypeParagraph()
    $r = $sel.Range
    $r.Text = ""
    try { $sel.Style = $doc.Styles.Item("Heading 1") } catch {}
    $sel.TypeText("─────────────────────────────────────────────────────────────")
    $sel.TypeParagraph()
    try { $sel.Style = $doc.Styles.Item("Heading 1") } catch {}
    $sel.TypeText("ARQUITECTURA v2 — ADICIONES Y CORRECCIONES")
    $sel.TypeParagraph()
    try { $sel.Style = $doc.Styles.Item("Normal") } catch {}
    $sel.TypeText("Las siguientes secciones han sido agregadas o actualizadas en la versión 2.0 de este documento para resolver las inconsistencias críticas detectadas en el análisis: INC-ARQ-01, INC-ARQ-02, INC-ARQ-03, INC-AUD-01 e INC-FOR-02.")
    $sel.TypeParagraph()

    # ======================================================
    # SECCIÓN: Capa Offline Móvil
    # ======================================================
    $sel.TypeParagraph()
    try { $sel.Style = $doc.Styles.Item("Heading 1") } catch {}
    $sel.TypeText("7. Capa Offline Móvil  [NUEVA — v2]  (Resuelve: INC-ARQ-03)")
    $sel.TypeParagraph()
    try { $sel.Style = $doc.Styles.Item("Normal") } catch {}
    $sel.TypeText("Contexto: Los residentes de obra trabajan en campo con conectividad intermitente o nula. El sistema debe permitir registrar avances físicos, consumos de materiales y evidencias fotográficas sin necesidad de conexión permanente a Internet.")
    $sel.TypeParagraph()

    try { $sel.Style = $doc.Styles.Item("Heading 2") } catch {}
    $sel.TypeText("7.1 Componentes de la Capa Offline")
    $sel.TypeParagraph()
    try { $sel.Style = $doc.Styles.Item("Normal") } catch {}

    $offlineComponents = @(
        "Local Cache: Almacena respuestas de API recientes para lectura offline (proyectos, rubros, materiales). Estrategia: Cache-First para recursos estáticos, Network-First para datos dinámicos.",
        "IndexedDB / Storage Local: Base de datos estructurada en el cliente. Persiste registros de avances, consumos y rutas de evidencias fotográficas pendientes de sincronización.",
        "Cola Local de Operaciones: Cola FIFO que registra cada operación CUD ejecutada offline (tipo, payload, timestamp, intentos). Garantiza orden de ejecución al sincronizar.",
        "Sync Manager: Detecta cambio de estado de conectividad (online/offline). Al recuperar conexión, procesa la cola local, envía operaciones a la API y actualiza el estado de cada registro.",
        "Resolución de Conflictos: Estrategia básica: last-write-wins con timestamp del cliente. Conflictos críticos se marcan para revisión manual por el Administrador.",
        "Indicadores Visuales: Cada registro pendiente muestra estado: Pendiente / Sincronizado / Error."
    )
    foreach ($c in $offlineComponents) {
        $sel.TypeText($c)
        $sel.TypeParagraph()
    }

    try { $sel.Style = $doc.Styles.Item("Heading 2") } catch {}
    $sel.TypeText("7.2 Flujo Offline → Sincronización")
    $sel.TypeParagraph()
    try { $sel.Style = $doc.Styles.Item("Normal") } catch {}

    $offlineFlow = @(
        "[Residente en campo — sin internet]"
        "  ↓"
        "[Registra avance en la UI del dispositivo]"
        "  ↓"
        "[IndexedDB: INSERT avance_local {payload, timestamp, estado: PENDIENTE}]"
        "  ↓"
        "[Cola Local: enqueue({tipo: POST, ruta: /avances, payload})]"
        "  ↓"
        "... el dispositivo espera conectividad ..."
        "  ↓"
        "[Dispositivo recupera conexión — Sync Manager detecta evento 'online']"
        "  ↓"
        "[Procesa cola: POST /api/v1/avances con JWT]"
        "  ├─ 201 Created → estado: SINCRONIZADO, eliminar de cola"
        "  └─ 4xx/5xx    → estado: ERROR, reintento en N minutos"
    )
    foreach ($line in $offlineFlow) {
        $sel.TypeText($line)
        $sel.TypeParagraph()
    }

    try { $sel.Style = $doc.Styles.Item("Heading 2") } catch {}
    $sel.TypeText("7.3 Consideraciones Técnicas")
    $sel.TypeParagraph()
    try { $sel.Style = $doc.Styles.Item("Normal") } catch {}
    $sel.TypeText("Service Worker: Registrado en main.jsx vía vite-plugin-pwa. Controla la caché de recursos estáticos. IndexedDB: Schemas avances_pendientes, consumos_pendientes, evidencias_pendientes. Seguridad: Los tokens JWT se almacenan en memoria (no localStorage) para minimizar riesgo XSS.")
    $sel.TypeParagraph()

    # ======================================================
    # SECCIÓN: Servicios Transversales de Infraestructura
    # ======================================================
    $sel.TypeParagraph()
    try { $sel.Style = $doc.Styles.Item("Heading 1") } catch {}
    $sel.TypeText("8. Servicios Transversales de Infraestructura  [NUEVA — v2]")
    $sel.TypeParagraph()
    try { $sel.Style = $doc.Styles.Item("Normal") } catch {}
    $sel.TypeText("La arquitectura v2 formaliza cuatro servicios de infraestructura transversales que son invocados por múltiples módulos de negocio y que en la versión anterior no estaban modelados o solo existían de forma implícita.")
    $sel.TypeParagraph()

    # ---- 8.1 StorageService ----
    try { $sel.Style = $doc.Styles.Item("Heading 2") } catch {}
    $sel.TypeText("8.1 StorageService  (Resuelve: INC-ARQ-01)")
    $sel.TypeParagraph()
    try { $sel.Style = $doc.Styles.Item("Normal") } catch {}
    $sel.TypeText("Contexto: El sistema gestiona evidencias fotográficas de obra y planillas PDF que deben almacenarse de forma persistente y ser recuperables mediante URL.")
    $sel.TypeParagraph()
    $sel.TypeText("Responsabilidades: Recepción y validación de archivos (imágenes/PDFs). Validación de formato y tamaño. Compresión de imágenes. Almacenamiento con nombre único (UUID + extensión). Asociación al avance_obra, rubro, proyecto y usuario. Generación de URL de consulta. Soporte para planillas PDF como artefactos de cierre contable.")
    $sel.TypeParagraph()
    $sel.TypeText("Posición: Infraestructura transversal. Lo invocan: ProgressService, AccountingService, QueueService.")
    $sel.TypeParagraph()
    $sel.TypeText("Integración con modelo de datos: avance_obra → evidencia_fotografica {id, idAvance, nombreArchivo, urlArchivo, tamaño, timestamp}")
    $sel.TypeParagraph()

    # ---- 8.2 QueueService ----
    try { $sel.Style = $doc.Styles.Item("Heading 2") } catch {}
    $sel.TypeText("8.2 QueueService  (Resuelve: INC-ARQ-02)")
    $sel.TypeParagraph()
    try { $sel.Style = $doc.Styles.Item("Normal") } catch {}
    $sel.TypeText("Contexto: La generación de planillas PDF (cierre mensual → rendering HTML/CSS → PDF) es costosa y no debe bloquear el hilo principal ni la respuesta HTTP al usuario.")
    $sel.TypeParagraph()
    $sel.TypeText("Responsabilidades: Recepción de trabajos de generación diferida. Procesamiento asíncrono. Control de estados: PENDIENTE → EN_PROCESO → COMPLETADO | ERROR. Reintentos automáticos. Notificación al NotificationService al completar. Almacenamiento del artefacto vía StorageService.")
    $sel.TypeParagraph()
    $sel.TypeText("Flujo: POST /cierres/:id/generar-planilla → AccountingService valida cierre → QueueService.enqueue() → HTTP 202 Accepted → (async) genera PDF → StorageService guarda → UPDATE planilla_pdf → NotificationService notifica.")
    $sel.TypeParagraph()

    # ---- 8.3 NotificationService ----
    try { $sel.Style = $doc.Styles.Item("Heading 2") } catch {}
    $sel.TypeText("8.3 NotificationService  (NUEVA — v2)")
    $sel.TypeParagraph()
    try { $sel.Style = $doc.Styles.Item("Normal") } catch {}
    $sel.TypeText("Responsabilidades: Notificaciones de planillas PDF listas. Notificaciones de aprobación/rechazo de requerimientos de compra. Avisos de errores críticos de sincronización. Alertas funcionales configurables por rol.")
    $sel.TypeParagraph()
    $sel.TypeText("Abstracción: El servicio no queda acoplado a ningún proveedor. La implementación puede usar Nodemailer, SendGrid u otro canal configurable mediante variables de entorno. La interfaz pública es: notificationService.send({ destinatario, asunto, plantilla, datos }).")
    $sel.TypeParagraph()

    # ---- 8.4 AuditService ----
    try { $sel.Style = $doc.Styles.Item("Heading 2") } catch {}
    $sel.TypeText("8.4 AuditService (Formalización — v2)  (Resuelve: INC-AUD-01)")
    $sel.TypeParagraph()
    try { $sel.Style = $doc.Styles.Item("Normal") } catch {}
    $sel.TypeText("Responsabilidades: Registro de INSERT/UPDATE/DELETE en audit_log. Captura de datos antes y después (datosAntes / datosDespues en JSONB). Registro de IP de origen con soporte X-Forwarded-For. Trazabilidad de cierres contables, aprobaciones y accesos denegados. Sin interrupción del flujo principal.")
    $sel.TypeParagraph()
    $sel.TypeText("Implementación en dos niveles: (1) Nivel aplicación — audit.middleware.js + audit.service.js — cubre todas las rutas con POST/PUT/PATCH/DELETE. (2) Nivel base de datos — Triggers BEFORE UPDATE / BEFORE DELETE sobre audit_log — protege contra modificación directa vía psql o herramientas externas.")
    $sel.TypeParagraph()

    # ======================================================
    # SECCIÓN: Auditoría Técnica y Trazabilidad v2
    # ======================================================
    $sel.TypeParagraph()
    try { $sel.Style = $doc.Styles.Item("Heading 1") } catch {}
    $sel.TypeText("9. Auditoría Técnica y Trazabilidad (Actualización v2)  (Resuelve: INC-AUD-01)")
    $sel.TypeParagraph()
    try { $sel.Style = $doc.Styles.Item("Heading 2") } catch {}
    $sel.TypeText("9.1 Campos de audit_log")
    $sel.TypeParagraph()
    try { $sel.Style = $doc.Styles.Item("Normal") } catch {}
    $sel.TypeText("id (BIGSERIAL) — Clave primaria autoincremental | tabla (VARCHAR) — Tabla afectada | operacion (ENUM: INSERT/UPDATE/DELETE) | id_registro (UUID) — Registro modificado | id_usuario (UUID) — Usuario que ejecutó la acción | datos_antes (JSONB) — null en INSERT | datos_despues (JSONB) — null en DELETE | ip_origen (INET) — IP del cliente | modulo (VARCHAR) — /avances, /compras, etc. | timestamp (TIMESTAMPTZ) — Fecha exacta con zona horaria.")
    $sel.TypeParagraph()

    try { $sel.Style = $doc.Styles.Item("Heading 2") } catch {}
    $sel.TypeText("9.2 Garantía de Inmutabilidad (NUEVA — v2)")
    $sel.TypeParagraph()
    try { $sel.Style = $doc.Styles.Item("Normal") } catch {}
    $sel.TypeText("Nivel de aplicación: audit.service.logAction() solo ejecuta INSERT. No existe ninguna ruta ni controlador que ejecute UPDATE o DELETE sobre audit_log.")
    $sel.TypeParagraph()
    $sel.TypeText("Nivel de base de datos (v2 — recomendado):")
    $sel.TypeParagraph()
    $sel.TypeText("-- Trigger que impide UPDATE sobre audit_log")
    $sel.TypeParagraph()
    $sel.TypeText("CREATE OR REPLACE FUNCTION audit_log_no_update()")
    $sel.TypeParagraph()
    $sel.TypeText("RETURNS TRIGGER AS $$")
    $sel.TypeParagraph()
    $sel.TypeText("BEGIN")
    $sel.TypeParagraph()
    $sel.TypeText("  RAISE EXCEPTION 'Los registros de audit_log son inmutables.';")
    $sel.TypeParagraph()
    $sel.TypeText("END;")
    $sel.TypeParagraph()
    $sel.TypeText("$$ LANGUAGE plpgsql;")
    $sel.TypeParagraph()
    $sel.TypeText("CREATE TRIGGER trg_audit_log_no_update BEFORE UPDATE ON audit_log FOR EACH ROW EXECUTE FUNCTION audit_log_no_update();")
    $sel.TypeParagraph()
    $sel.TypeText("CREATE TRIGGER trg_audit_log_no_delete BEFORE DELETE ON audit_log FOR EACH ROW EXECUTE FUNCTION audit_log_no_delete();")
    $sel.TypeParagraph()

    # ======================================================
    # TABLA: Resolución de Inconsistencias
    # ======================================================
    $sel.TypeParagraph()
    try { $sel.Style = $doc.Styles.Item("Heading 1") } catch {}
    $sel.TypeText("16. Resolución de Inconsistencias Críticas de Arquitectura")
    $sel.TypeParagraph()
    try { $sel.Style = $doc.Styles.Item("Normal") } catch {}
    $sel.TypeText("Con los cambios incorporados en la Arquitectura v2, el documento queda alineado con los requisitos funcionales, no funcionales, historias técnicas, plan de pruebas e informe de ejecución.")
    $sel.TypeParagraph()

    # Insertar tabla de resolución
    $tableRange = $sel.Range
    $table = $doc.Tables.Add($tableRange, 6, 4)
    $table.Borders.Enable = $true

    # Encabezados
    $table.Cell(1,1).Range.Text = "Código"
    $table.Cell(1,2).Range.Text = "Inconsistencia detectada"
    $table.Cell(1,3).Range.Text = "Cambio aplicado en v2"
    $table.Cell(1,4).Range.Text = "Estado"

    # Datos
    $rows = @(
        @{ Code="INC-ARQ-03"; Issue="No existía capa offline explícita para la app móvil."; Fix="Agregada Sección 7: Capa Offline Móvil con Local Cache, IndexedDB, Sync Manager, Cola Local, indicadores visuales y flujo de sincronización."; Status="Resuelta" },
        @{ Code="INC-ARQ-01"; Issue="No estaba modelado el almacenamiento de evidencias fotográficas."; Fix="Incorporado StorageService como servicio transversal (Sección 8.1), con responsabilidades e integración con evidencia_fotografica."; Status="Resuelta" },
        @{ Code="INC-ARQ-02"; Issue="No estaba modelado el procesamiento diferido de planillas PDF."; Fix="Incorporado QueueService (Sección 8.2) con flujo asíncrono, estados de trabajo y conexiones con StorageService y NotificationService."; Status="Resuelta" },
        @{ Code="INC-AUD-01"; Issue="Inmutabilidad de audit_log solo a nivel de aplicación, sin respaldo en BD."; Fix="Agregada Sección 9.2 con triggers SQL BEFORE UPDATE/DELETE para PostgreSQL que garantizan inmutabilidad a nivel de motor."; Status="Resuelta" },
        @{ Code="INC-FOR-02"; Issue="Nombre empresa con variantes inconsistentes en todo el documento."; Fix="Unificado como ICARO CONSTRUCTORES BMGM S.A.S. mediante Find & Replace global en todo el documento."; Status="Resuelta" }
    )

    for ($i = 0; $i -lt $rows.Count; $i++) {
        $r = $rows[$i]
        $table.Cell($i+2, 1).Range.Text = $r.Code
        $table.Cell($i+2, 2).Range.Text = $r.Issue
        $table.Cell($i+2, 3).Range.Text = $r.Fix
        $table.Cell($i+2, 4).Range.Text = $r.Status
    }

    # Negrita en encabezados de tabla
    for ($col = 1; $col -le 4; $col++) {
        $table.Cell(1, $col).Range.Bold = $true
    }

    # Mover después de la tabla
    $sel.EndKey(6) | Out-Null
    $sel.TypeParagraph()
    try { $sel.Style = $doc.Styles.Item("Normal") } catch {}
    $sel.TypeText("Con los cambios incorporados en la Arquitectura v2, el documento deja de presentar inconsistencias críticas de arquitectura. La solución queda alineada con los requisitos funcionales, requisitos no funcionales, historias técnicas, plan de pruebas e informe de ejecución, manteniendo la estructura base del documento original y reforzando únicamente los componentes necesarios para resolver las brechas detectadas.")
    $sel.TypeParagraph()

    # ------------------------------------------------------------------
    # 6. Guardar y cerrar
    # ------------------------------------------------------------------
    Write-Host "`n[6/6] Guardando $v2Path ..."
    $doc.Save()
    $doc.Close()
    $word.Quit()
    Write-Host "`n✅  Arquitectura_Sistema_ICARO_v2.docx generado exitosamente."
    Write-Host "    Ruta: $v2Path"

} catch {
    Write-Error "ERROR durante generación: $_"
    try { $doc.Close([ref]$false) } catch {}
    try { $word.Quit() } catch {}
    exit 1
}
