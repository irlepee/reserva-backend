/*
  Warnings:

  - Made the column `closing_hour` on table `Site` required. This step will fail if there are existing NULL values in that column.
  - Made the column `opening_hour` on table `Site` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Site" ALTER COLUMN "closing_hour" SET NOT NULL,
ALTER COLUMN "opening_hour" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "gender" SET DATA TYPE CHAR;

-- CreateTable
CREATE TABLE "NotificationType" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "description" TEXT,

    CONSTRAINT "NotificationType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" BIGSERIAL NOT NULL,
    "id_user" BIGINT NOT NULL,
    "id_type" INTEGER NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "body" TEXT,
    "data" JSONB,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NotificationType_name_key" ON "NotificationType"("name");

-- CreateIndex
CREATE INDEX "Notification_id_user_read_createdAt_idx" ON "Notification"("id_user", "read", "createdAt");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_id_type_fkey" FOREIGN KEY ("id_type") REFERENCES "NotificationType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
