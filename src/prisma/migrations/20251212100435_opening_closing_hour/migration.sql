-- AlterTable
ALTER TABLE "Site" ADD COLUMN     "closing_hour" TEXT,
ADD COLUMN     "opening_hour" TEXT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "gender" SET DATA TYPE CHAR;
