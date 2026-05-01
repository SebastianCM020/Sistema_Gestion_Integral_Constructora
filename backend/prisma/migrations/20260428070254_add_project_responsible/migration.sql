-- AlterTable
ALTER TABLE "proyectos" ADD COLUMN     "id_responsable" UUID;

-- AddForeignKey
ALTER TABLE "proyectos" ADD CONSTRAINT "proyectos_id_responsable_fkey" FOREIGN KEY ("id_responsable") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
