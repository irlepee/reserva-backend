-- AlterTable
ALTER TABLE "Site" ADD COLUMN     "images" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "gender" SET DATA TYPE CHAR;
