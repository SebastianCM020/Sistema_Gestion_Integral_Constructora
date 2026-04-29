/*
  Warnings:

  - Added the required column `categoria` to the `materiales` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `materiales` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "materiales" ADD COLUMN     "categoria" VARCHAR(80) NOT NULL,
ADD COLUMN     "descripcion" TEXT,
ADD COLUMN     "updated_at" TIMESTAMPTZ NOT NULL;

-- CreateTable
CREATE TABLE "movimiento_inventario" (
    "id" UUID NOT NULL,
    "id_material" UUID NOT NULL,
    "id_proyecto" UUID NOT NULL,
    "id_usuario" UUID NOT NULL,
    "tipo_movimiento" VARCHAR(20) NOT NULL,
    "cantidad" DECIMAL(12,4) NOT NULL,
    "cantidad_anterior" DECIMAL(12,4) NOT NULL DEFAULT 0,
    "cantidad_resultante" DECIMAL(12,4) NOT NULL DEFAULT 0,
    "observacion" TEXT,
    "fecha_movimiento" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "movimiento_inventario_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "movimiento_inventario" ADD CONSTRAINT "movimiento_inventario_id_material_fkey" FOREIGN KEY ("id_material") REFERENCES "materiales"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimiento_inventario" ADD CONSTRAINT "movimiento_inventario_id_proyecto_fkey" FOREIGN KEY ("id_proyecto") REFERENCES "proyectos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimiento_inventario" ADD CONSTRAINT "movimiento_inventario_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
