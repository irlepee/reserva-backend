/*
  Warnings:

  - You are about to drop the `Notification` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `NotificationType` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "gender" SET DATA TYPE CHAR;

-- DropTable
DROP TABLE "public"."Notification";

-- DropTable
DROP TABLE "public"."NotificationType";
