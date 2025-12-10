/*
  Warnings:

  - You are about to drop the `group` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `notification` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `notification_type` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `reserva` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `resource` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `resource_type` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `site` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_group` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "public"."group";

-- DropTable
DROP TABLE "public"."notification";

-- DropTable
DROP TABLE "public"."notification_type";

-- DropTable
DROP TABLE "public"."reserva";

-- DropTable
DROP TABLE "public"."resource";

-- DropTable
DROP TABLE "public"."resource_type";

-- DropTable
DROP TABLE "public"."site";

-- DropTable
DROP TABLE "public"."user";

-- DropTable
DROP TABLE "public"."user_group";

-- CreateTable
CREATE TABLE "Group" (
    "id" INTEGER NOT NULL,
    "id_owner" INTEGER NOT NULL,
    "name" VARCHAR(64) NOT NULL,
    "date_created" DATE NOT NULL,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" BIGINT NOT NULL,
    "id_owner" BIGINT NOT NULL,
    "notification_type" SMALLINT NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationType" (
    "id" INTEGER NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "NotificationType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reserva" (
    "id" BIGINT NOT NULL,
    "id_owner" BIGINT NOT NULL,
    "id_resource" INTEGER NOT NULL,
    "start_date" TIMESTAMPTZ(0) NOT NULL,
    "end_date" TIMESTAMPTZ(0) NOT NULL,
    "status" BOOLEAN NOT NULL,
    "id_group" INTEGER,

    CONSTRAINT "Reserva_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Resource" (
    "id" INTEGER NOT NULL,
    "id_site" INTEGER NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "date_created" DATE NOT NULL,
    "resource_type" INTEGER NOT NULL,
    "capacity" INTEGER,
    "status" BOOLEAN NOT NULL,

    CONSTRAINT "Resource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResourceType" (
    "id" INTEGER NOT NULL,
    "name" VARCHAR(40) NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "ResourceType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Site" (
    "id" SERIAL NOT NULL,
    "id_owner" BIGINT NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "date_created" DATE NOT NULL,
    "id_entidad" INTEGER,
    "id_municipio" INTEGER,
    "id_localidad" INTEGER,

    CONSTRAINT "Site_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" BIGSERIAL NOT NULL,
    "username" VARCHAR(24) NOT NULL,
    "name" VARCHAR(50),
    "lastname" VARCHAR(50),
    "age" SMALLINT,
    "gender" CHAR,
    "email" VARCHAR(50) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "id_entidad" INTEGER,
    "id_municipio" INTEGER,
    "id_localidad" INTEGER,
    "emailConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "confirmationToken" TEXT,
    "createdAt" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserGroup" (
    "id_user" BIGINT NOT NULL,
    "id_group" INTEGER NOT NULL,

    CONSTRAINT "UserGroup_pkey" PRIMARY KEY ("id_user","id_group")
);

-- CreateTable
CREATE TABLE "Entidad" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Entidad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Municipio" (
    "id" INTEGER NOT NULL,
    "id_entidad" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Municipio_pkey" PRIMARY KEY ("id","id_entidad")
);

-- CreateTable
CREATE TABLE "Localidad" (
    "id" INTEGER NOT NULL,
    "id_entidad" INTEGER NOT NULL,
    "id_municipio" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Localidad_pkey" PRIMARY KEY ("id","id_entidad","id_municipio")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Site" ADD CONSTRAINT "Site_id_owner_fkey" FOREIGN KEY ("id_owner") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Municipio" ADD CONSTRAINT "Municipio_id_entidad_fkey" FOREIGN KEY ("id_entidad") REFERENCES "Entidad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Localidad" ADD CONSTRAINT "Localidad_id_municipio_id_entidad_fkey" FOREIGN KEY ("id_municipio", "id_entidad") REFERENCES "Municipio"("id", "id_entidad") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Localidad" ADD CONSTRAINT "Localidad_id_entidad_fkey" FOREIGN KEY ("id_entidad") REFERENCES "Entidad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
