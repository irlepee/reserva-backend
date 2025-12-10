-- AlterTable
ALTER TABLE "resource" ADD COLUMN     "capacity" INTEGER;

-- AlterTable
ALTER TABLE "site" ALTER COLUMN "id_estado" DROP NOT NULL,
ALTER COLUMN "id_municipio" DROP NOT NULL,
ALTER COLUMN "id_localidad" DROP NOT NULL;

-- AlterTable
ALTER TABLE "user" ALTER COLUMN "gender" SET DATA TYPE CHAR;
