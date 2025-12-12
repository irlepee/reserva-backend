/*
  Warnings:

  - Made the column `opening_hour` on table `Site` required. This step will fail if there are existing NULL values in that column.
  - Made the column `closing_hour` on table `Site` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Site" ALTER COLUMN "opening_hour" SET NOT NULL,
ALTER COLUMN "opening_hour" SET DEFAULT '08:00',
ALTER COLUMN "closing_hour" SET NOT NULL,
ALTER COLUMN "closing_hour" SET DEFAULT '18:00';

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "gender" SET DATA TYPE CHAR;
