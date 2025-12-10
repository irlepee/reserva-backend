-- AlterTable
ALTER TABLE "Group" ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "gender" SET DATA TYPE CHAR;
