-- AlterTable
ALTER TABLE "Site" ALTER COLUMN "closing_hour" DROP NOT NULL,
ALTER COLUMN "opening_hour" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "gender" SET DATA TYPE CHAR;
