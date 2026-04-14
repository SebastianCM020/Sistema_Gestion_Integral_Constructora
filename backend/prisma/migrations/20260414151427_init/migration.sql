-- CreateTable
CREATE TABLE "roles" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "descripcion" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" UUID NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "apellido" VARCHAR(100) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "id_rol" INTEGER NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proyectos" (
    "id" UUID NOT NULL,
    "codigo" VARCHAR(30) NOT NULL,
    "nombre" VARCHAR(200) NOT NULL,
    "descripcion" TEXT,
    "entidad_contratante" VARCHAR(200),
    "numero_contrato" VARCHAR(50),
    "presupuesto_total" DECIMAL(14,2) NOT NULL,
    "fecha_inicio" DATE NOT NULL,
    "fecha_fin_prevista" DATE NOT NULL,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'ACTIVO',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "proyectos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asignacion_proyecto_usuario" (
    "id" UUID NOT NULL,
    "id_usuario" UUID NOT NULL,
    "id_proyecto" UUID NOT NULL,
    "fecha_inicio" DATE NOT NULL,
    "fecha_fin" DATE NOT NULL,
    "access_mode" VARCHAR(20) NOT NULL DEFAULT 'READ_WRITE',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "asignacion_proyecto_usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rubros" (
    "id" UUID NOT NULL,
    "id_proyecto" UUID NOT NULL,
    "codigo" VARCHAR(30) NOT NULL,
    "descripcion" TEXT NOT NULL,
    "unidad" VARCHAR(20) NOT NULL,
    "precio_unitario" DECIMAL(12,4) NOT NULL,
    "cantidad_presupuestada" DECIMAL(12,4) NOT NULL,
    "cantidad_ejecutada" DECIMAL(12,4) NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rubros_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avance_obra" (
    "id" UUID NOT NULL,
    "id_proyecto" UUID NOT NULL,
    "id_rubro" UUID NOT NULL,
    "id_residente" UUID NOT NULL,
    "id_superintendente" UUID,
    "cantidad_avance" DECIMAL(12,4) NOT NULL,
    "fecha_registro" DATE NOT NULL,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'PENDING_SYNC',
    "sync_timestamp" TIMESTAMPTZ,
    "notas" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "avance_obra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evidencia_fotografica" (
    "id" UUID NOT NULL,
    "id_avance" UUID NOT NULL,
    "url_imagen" VARCHAR(500) NOT NULL,
    "storage_key" VARCHAR(300) NOT NULL,
    "size_bytes" INTEGER,
    "mime_type" VARCHAR(50),
    "timestamp_captura" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evidencia_fotografica_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "materiales" (
    "id" UUID NOT NULL,
    "codigo" VARCHAR(30) NOT NULL,
    "nombre" VARCHAR(200) NOT NULL,
    "unidad" VARCHAR(20) NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "materiales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "requerimiento_compra" (
    "id" UUID NOT NULL,
    "id_proyecto" UUID NOT NULL,
    "id_solicitante" UUID NOT NULL,
    "id_aprobador" UUID,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'EN_REVISION',
    "justificacion" TEXT,
    "comentario_rechazo" TEXT,
    "fecha_solicitud" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_aprobacion" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "requerimiento_compra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "detalle_requerimiento" (
    "id" UUID NOT NULL,
    "id_requerimiento" UUID NOT NULL,
    "id_material" UUID NOT NULL,
    "cantidad_solicitada" DECIMAL(12,4) NOT NULL,
    "cantidad_recibida" DECIMAL(12,4) NOT NULL DEFAULT 0,

    CONSTRAINT "detalle_requerimiento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventario_proyecto" (
    "id_material" UUID NOT NULL,
    "id_proyecto" UUID NOT NULL,
    "cantidad_disponible" DECIMAL(12,4) NOT NULL DEFAULT 0,
    "ultima_actualizacion" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventario_proyecto_pkey" PRIMARY KEY ("id_material","id_proyecto")
);

-- CreateTable
CREATE TABLE "cierre_mensual" (
    "id" UUID NOT NULL,
    "id_proyecto" UUID NOT NULL,
    "id_contador" UUID NOT NULL,
    "mes_anio" VARCHAR(7) NOT NULL,
    "estado_cierre" VARCHAR(10) NOT NULL DEFAULT 'ABIERTO',
    "monto_total" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "hash_seguridad" VARCHAR(64),
    "fecha_cierre" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cierre_mensual_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "planilla_pdf" (
    "id" UUID NOT NULL,
    "id_cierre" UUID NOT NULL,
    "id_generador" UUID NOT NULL,
    "url_archivo" VARCHAR(500),
    "storage_key" VARCHAR(300),
    "estado_gen" VARCHAR(15) NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "planilla_pdf_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_log" (
    "id" BIGSERIAL NOT NULL,
    "tabla" VARCHAR(60) NOT NULL,
    "operacion" VARCHAR(10) NOT NULL,
    "id_registro" UUID,
    "id_usuario" UUID,
    "datos_antes" JSONB,
    "datos_despues" JSONB,
    "ip_origen" VARCHAR(45),
    "timestamp" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_nombre_key" ON "roles"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "proyectos_codigo_key" ON "proyectos"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "materiales_codigo_key" ON "materiales"("codigo");

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_id_rol_fkey" FOREIGN KEY ("id_rol") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asignacion_proyecto_usuario" ADD CONSTRAINT "asignacion_proyecto_usuario_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asignacion_proyecto_usuario" ADD CONSTRAINT "asignacion_proyecto_usuario_id_proyecto_fkey" FOREIGN KEY ("id_proyecto") REFERENCES "proyectos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rubros" ADD CONSTRAINT "rubros_id_proyecto_fkey" FOREIGN KEY ("id_proyecto") REFERENCES "proyectos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avance_obra" ADD CONSTRAINT "avance_obra_id_proyecto_fkey" FOREIGN KEY ("id_proyecto") REFERENCES "proyectos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avance_obra" ADD CONSTRAINT "avance_obra_id_rubro_fkey" FOREIGN KEY ("id_rubro") REFERENCES "rubros"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avance_obra" ADD CONSTRAINT "avance_obra_id_residente_fkey" FOREIGN KEY ("id_residente") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avance_obra" ADD CONSTRAINT "avance_obra_id_superintendente_fkey" FOREIGN KEY ("id_superintendente") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidencia_fotografica" ADD CONSTRAINT "evidencia_fotografica_id_avance_fkey" FOREIGN KEY ("id_avance") REFERENCES "avance_obra"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requerimiento_compra" ADD CONSTRAINT "requerimiento_compra_id_proyecto_fkey" FOREIGN KEY ("id_proyecto") REFERENCES "proyectos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requerimiento_compra" ADD CONSTRAINT "requerimiento_compra_id_solicitante_fkey" FOREIGN KEY ("id_solicitante") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requerimiento_compra" ADD CONSTRAINT "requerimiento_compra_id_aprobador_fkey" FOREIGN KEY ("id_aprobador") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalle_requerimiento" ADD CONSTRAINT "detalle_requerimiento_id_requerimiento_fkey" FOREIGN KEY ("id_requerimiento") REFERENCES "requerimiento_compra"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalle_requerimiento" ADD CONSTRAINT "detalle_requerimiento_id_material_fkey" FOREIGN KEY ("id_material") REFERENCES "materiales"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventario_proyecto" ADD CONSTRAINT "inventario_proyecto_id_material_fkey" FOREIGN KEY ("id_material") REFERENCES "materiales"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventario_proyecto" ADD CONSTRAINT "inventario_proyecto_id_proyecto_fkey" FOREIGN KEY ("id_proyecto") REFERENCES "proyectos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cierre_mensual" ADD CONSTRAINT "cierre_mensual_id_proyecto_fkey" FOREIGN KEY ("id_proyecto") REFERENCES "proyectos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cierre_mensual" ADD CONSTRAINT "cierre_mensual_id_contador_fkey" FOREIGN KEY ("id_contador") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "planilla_pdf" ADD CONSTRAINT "planilla_pdf_id_cierre_fkey" FOREIGN KEY ("id_cierre") REFERENCES "cierre_mensual"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "planilla_pdf" ADD CONSTRAINT "planilla_pdf_id_generador_fkey" FOREIGN KEY ("id_generador") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
