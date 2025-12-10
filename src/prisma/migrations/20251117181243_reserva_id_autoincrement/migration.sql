-- AlterTable
CREATE SEQUENCE reserva_id_seq;
ALTER TABLE "Reserva" ADD COLUMN     "created_at" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "id" SET DEFAULT nextval('reserva_id_seq');
ALTER SEQUENCE reserva_id_seq OWNED BY "Reserva"."id";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "gender" SET DATA TYPE CHAR;

-- AddForeignKey
ALTER TABLE "Reserva" ADD CONSTRAINT "Reserva_id_owner_fkey" FOREIGN KEY ("id_owner") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reserva" ADD CONSTRAINT "Reserva_id_resource_fkey" FOREIGN KEY ("id_resource") REFERENCES "Resource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reserva" ADD CONSTRAINT "Reserva_id_group_fkey" FOREIGN KEY ("id_group") REFERENCES "Group"("id") ON DELETE SET NULL ON UPDATE CASCADE;
