$ErrorActionPreference = 'Stop'

$docsPath = "C:\Users\Hp\Desktop\Sistema_Gestion_Integral_Constructora\docs"
$v1Path   = Join-Path $docsPath "Arquitectura V1.docx"
$v2Path   = Join-Path $docsPath "Arquitectura_Sistema_ICARO_v2.docx"

Write-Host "[1/6] Copiando V1 como base de V2 ..."
Copy-Item -Path $v1Path -Destination $v2Path -Force
Write-Host "      OK: $v2Path"

Write-Host "[2/6] Iniciando Microsoft Word COM ..."
try {
    $word = New-Object -ComObject Word.Application
    $word.Visible = $false
} catch {
    Write-Error "No se pudo iniciar Microsoft Word. Verifique que este instalado."
    exit 1
}

try {
    $doc = $word.Documents.Open($v2Path)
    Write-Host "      Documento abierto."

    Write-Host "[3/6] Find & Replace nombre empresa (INC-FOR-02) ..."
    $wdReplaceAll = 2
    $replacements = @(
        @("ICAROCONSTRUCTORES BMGM S.A.S",     "ICARO CONSTRUCTORES BMGM S.A.S."),
        @("ICAROCONSTRUCTORES BMGM S.A.S.",    "ICARO CONSTRUCTORES BMGM S.A.S."),
        @("ICARO CONSTRUCTORES BMGM S.A.S",    "ICARO CONSTRUCTORES BMGM S.A.S."),
        @("CONSTRUCTORES BMGM S.A.S.",         "ICARO CONSTRUCTORES BMGM S.A.S."),
        @("CONSTRUCTORES BMGM S.A.S",          "ICARO CONSTRUCTORES BMGM S.A.S.")
    )
    foreach ($r in $replacements) {
        $find = $doc.Content.Find
        $find.ClearFormatting()
        $find.Replacement.ClearFormatting()
        $find.Text = $r[0]
        $find.Replacement.Text = $r[1]
        $find.Execute($null,$null,$null,$null,$null,$null,$true,$null,$null,$null,$wdReplaceAll) | Out-Null
        Write-Host "      Reemplazado: '$($r[0])'"
    }

    Write-Host "[4/6] Actualizando version ..."
    $vFixes = @(
        @("Version: 1.0", "Version: 2.0"),
        @("Version 1.0",  "Version 2.0"),
        @("7/04/2026",    "25/04/2026")
    )
    foreach ($r in $vFixes) {
        $f2 = $doc.Content.Find
        $f2.ClearFormatting()
        $f2.Replacement.ClearFormatting()
        $f2.Text = $r[0]
        $f2.Replacement.Text = $r[1]
        $f2.Execute($null,$null,$null,$null,$null,$null,$true,$null,$null,$null,$wdReplaceAll) | Out-Null
    }

    Write-Host "[5/6] Agregando secciones v2 ..."
    $sel = $word.Selection
    $sel.EndKey(6) | Out-Null

    function H1 { param($t)
        try { $script:sel.Style = $script:doc.Styles.Item("Heading 1") } catch {}
        $script:sel.TypeText($t)
        $script:sel.TypeParagraph()
        try { $script:sel.Style = $script:doc.Styles.Item("Normal") } catch {}
    }
    function H2 { param($t)
        try { $script:sel.Style = $script:doc.Styles.Item("Heading 2") } catch {}
        $script:sel.TypeText($t)
        $script:sel.TypeParagraph()
        try { $script:sel.Style = $script:doc.Styles.Item("Normal") } catch {}
    }
    function P { param($t)
        $script:sel.TypeText($t)
        $script:sel.TypeParagraph()
    }

    $sel.TypeParagraph()
    H1 "ARQUITECTURA v2 - ADICIONES Y CORRECCIONES"
    P "Las siguientes secciones fueron agregadas o actualizadas en la version 2.0 para resolver las inconsistencias criticas: INC-ARQ-01, INC-ARQ-02, INC-ARQ-03, INC-AUD-01 e INC-FOR-02."

    $sel.TypeParagraph()
    H1 "7. Capa Offline Movil [NUEVA - v2]  |  Resuelve: INC-ARQ-03"
    P "Contexto: Los residentes de obra trabajan en campo con conectividad intermitente o nula. El sistema debe permitir registrar avances fisicos, consumos de materiales y evidencias fotograficas sin conexion permanente a Internet."

    H2 "7.1 Componentes de la Capa Offline"
    P "Local Cache: Almacena respuestas de API recientes para lectura offline (proyectos, rubros, materiales). Estrategia Cache-First para estaticos, Network-First para dinamicos."
    P "IndexedDB / Storage Local: Base de datos estructurada en el cliente. Persiste avances, consumos y rutas de evidencias fotograficas pendientes de sincronizacion."
    P "Cola Local de Operaciones: Cola FIFO que registra cada operacion CUD ejecutada offline (tipo, payload, timestamp, intentos). Garantiza orden de ejecucion al sincronizar."
    P "Sync Manager: Detecta cambio de conectividad (online/offline). Al recuperar conexion, procesa la cola local, envia operaciones a la API y actualiza el estado de cada registro."
    P "Resolucion de Conflictos: Estrategia last-write-wins con timestamp del cliente. Conflictos criticos se marcan para revision manual por el Administrador."
    P "Indicadores Visuales: Cada registro muestra estado: Pendiente / Sincronizado / Error."

    H2 "7.2 Flujo Offline a Sincronizacion"
    P "[Residente en campo sin internet]"
    P "  -> Registra avance en la UI del dispositivo"
    P "  -> IndexedDB INSERT avance_local {payload, timestamp, estado: PENDIENTE}"
    P "  -> Cola Local enqueue {tipo: POST, ruta: /avances, payload}"
    P "  ... dispositivo espera conectividad ..."
    P "  -> Sync Manager detecta evento online"
    P "  -> Procesa cola: POST /api/v1/avances con JWT"
    P "     201 Created -> estado: SINCRONIZADO, eliminar de cola"
    P "     4xx/5xx     -> estado: ERROR, reintento en N minutos"

    H2 "7.3 Consideraciones Tecnicas"
    P "Service Worker: Registrado en main.jsx via vite-plugin-pwa. Schemas IndexedDB: avances_pendientes, consumos_pendientes, evidencias_pendientes. Tokens JWT en memoria (no localStorage) para minimizar riesgo XSS."

    $sel.TypeParagraph()
    H1 "8. Servicios Transversales de Infraestructura [NUEVA - v2]"
    P "La arquitectura v2 formaliza cuatro servicios transversales que en v1 no estaban modelados o solo existian de forma implicita."

    H2 "8.1 StorageService  |  Resuelve: INC-ARQ-01"
    P "Contexto: El sistema gestiona evidencias fotograficas de obra y planillas PDF que deben almacenarse de forma persistente y ser recuperables mediante URL."
    P "Responsabilidades: Recepcion y validacion de archivos (imagenes/PDFs). Compresion de imagenes. Almacenamiento con nombre unico UUID+extension. Asociacion a avance_obra, rubro, proyecto y usuario. Generacion de URL de consulta."
    P "Posicion en arquitectura: Infraestructura transversal. Lo invocan: ProgressService, AccountingService, QueueService."
    P "Integracion modelo de datos: avance_obra -> evidencia_fotografica {id, idAvance, nombreArchivo, urlArchivo, tamano, timestamp}"

    H2 "8.2 QueueService  |  Resuelve: INC-ARQ-02"
    P "Contexto: La generacion de planillas PDF es costosa y no debe bloquear el hilo principal ni la respuesta HTTP."
    P "Responsabilidades: Recepcion de trabajos de generacion diferida. Procesamiento asincrono. Estados: PENDIENTE -> EN_PROCESO -> COMPLETADO | ERROR. Reintentos automaticos. Notificacion al NotificationService al completar. Almacenamiento via StorageService."
    P "Flujo: POST /cierres/:id/generar-planilla -> AccountingService valida -> QueueService.enqueue() -> HTTP 202 Accepted -> (async) genera PDF -> StorageService guarda -> UPDATE planilla_pdf -> NotificationService notifica."

    H2 "8.3 NotificationService [NUEVA - v2]"
    P "Responsabilidades: Notificaciones de planillas PDF listas. Aprobacion/rechazo de requerimientos. Errores criticos de sincronizacion. Alertas por rol."
    P "Abstraccion: No acoplado a ningun proveedor. Implementacion configurable: Nodemailer, SendGrid u otro. Interfaz: notificationService.send({ destinatario, asunto, plantilla, datos })."

    H2 "8.4 AuditService - Formalizacion v2  |  Resuelve: INC-AUD-01"
    P "Responsabilidades: Registro INSERT/UPDATE/DELETE en audit_log. Captura datos antes/despues (JSONB). Registro IP origen con soporte X-Forwarded-For. Trazabilidad de cierres, aprobaciones y accesos denegados. Sin interrupcion del flujo principal."
    P "Nivel aplicacion: audit.middleware.js + audit.service.js - cubre todas las rutas POST/PUT/PATCH/DELETE."
    P "Nivel base de datos (v2): Triggers BEFORE UPDATE / BEFORE DELETE sobre audit_log para proteger contra modificacion directa vía herramientas externas."

    $sel.TypeParagraph()
    H1 "9. Auditoria Tecnica y Trazabilidad - Actualizacion v2  |  Resuelve: INC-AUD-01"

    H2 "9.1 Campos de audit_log"
    P "id BIGSERIAL: Clave primaria autoincremental."
    P "tabla VARCHAR: Tabla de negocio afectada."
    P "operacion ENUM: INSERT | UPDATE | DELETE."
    P "id_registro UUID: Identificador del registro modificado."
    P "id_usuario UUID: Usuario que ejecuto la accion."
    P "datos_antes JSONB: Snapshot del estado previo (null en INSERT)."
    P "datos_despues JSONB: Snapshot del estado posterior (null en DELETE)."
    P "ip_origen INET: IP del cliente o X-Forwarded-For."
    P "modulo VARCHAR: /avances, /compras, /cierres, etc."
    P "timestamp TIMESTAMPTZ: Fecha y hora exacta con zona horaria."

    H2 "9.2 Garantia de Inmutabilidad a Nivel de Base de Datos [NUEVA v2]"
    P "Nivel aplicacion: audit.service.logAction() solo ejecuta INSERT. No existe ruta ni controlador que ejecute UPDATE o DELETE sobre audit_log."
    P "Nivel base de datos SQL:"
    P "CREATE OR REPLACE FUNCTION audit_log_no_update() RETURNS TRIGGER AS"
    P "BEGIN  RAISE EXCEPTION El registro audit_log es inmutable;  END  LANGUAGE plpgsql;"
    P "CREATE TRIGGER trg_audit_log_no_update BEFORE UPDATE ON audit_log FOR EACH ROW EXECUTE FUNCTION audit_log_no_update();"
    P "CREATE OR REPLACE FUNCTION audit_log_no_delete() RETURNS TRIGGER AS"
    P "BEGIN  RAISE EXCEPTION El registro audit_log es inmutable;  END  LANGUAGE plpgsql;"
    P "CREATE TRIGGER trg_audit_log_no_delete BEFORE DELETE ON audit_log FOR EACH ROW EXECUTE FUNCTION audit_log_no_delete();"

    $sel.TypeParagraph()
    H1 "16. Resolucion de Inconsistencias Criticas de Arquitectura"
    P "Con los cambios incorporados en la Arquitectura v2, el documento queda alineado con los requisitos funcionales, no funcionales, historias tecnicas, plan de pruebas e informe de ejecucion."

    $tableRange = $sel.Range.Duplicate
    $table = $doc.Tables.Add($tableRange, 6, 4)
    $table.Borders.Enable = $true
    $table.Cell(1,1).Range.Text = "Codigo"
    $table.Cell(1,2).Range.Text = "Inconsistencia detectada"
    $table.Cell(1,3).Range.Text = "Cambio aplicado en v2"
    $table.Cell(1,4).Range.Text = "Estado"
    for ($c = 1; $c -le 4; $c++) { $table.Cell(1,$c).Range.Bold = $true }

    $rows = @(
        @("INC-ARQ-03", "No existia capa offline explicita para la app movil.", "Seccion 7 agregada: Local Cache, IndexedDB, Sync Manager, Cola Local, indicadores visuales y flujo de sincronizacion.", "Resuelta"),
        @("INC-ARQ-01", "No estaba modelado el almacenamiento de evidencias fotograficas.", "StorageService agregado como servicio transversal (Sec. 8.1) con integracion a evidencia_fotografica.", "Resuelta"),
        @("INC-ARQ-02", "No estaba modelado el procesamiento diferido de planillas PDF.", "QueueService agregado (Sec. 8.2) con flujo asincrono, estados y conexion con StorageService y NotificationService.", "Resuelta"),
        @("INC-AUD-01", "Inmutabilidad de audit_log solo a nivel de aplicacion, sin respaldo en BD.", "Seccion 9.2 agregada con triggers SQL BEFORE UPDATE/DELETE para PostgreSQL.", "Resuelta"),
        @("INC-FOR-02", "Nombre empresa con variantes inconsistentes.", "Unificado como ICARO CONSTRUCTORES BMGM S.A.S. mediante Find & Replace global.", "Resuelta")
    )
    for ($i = 0; $i -lt $rows.Count; $i++) {
        $r = $rows[$i]
        $table.Cell($i+2, 1).Range.Text = $r[0]
        $table.Cell($i+2, 2).Range.Text = $r[1]
        $table.Cell($i+2, 3).Range.Text = $r[2]
        $table.Cell($i+2, 4).Range.Text = $r[3]
    }

    $sel.EndKey(6) | Out-Null
    $sel.TypeParagraph()
    P "Con los cambios incorporados en la Arquitectura v2, el documento deja de presentar inconsistencias criticas. La solucion queda alineada con los requisitos funcionales, historias tecnicas y plan de pruebas, manteniendo la estructura base del documento original."

    Write-Host "[6/6] Guardando ..."
    $doc.Save()
    $doc.Close()
    $word.Quit()
    Write-Host "OK - Arquitectura_Sistema_ICARO_v2.docx generado."
    Write-Host "Ruta: $v2Path"

} catch {
    Write-Error "ERROR: $_"
    try { $doc.Close([ref]$false) } catch {}
    try { $word.Quit() } catch {}
    exit 1
}
