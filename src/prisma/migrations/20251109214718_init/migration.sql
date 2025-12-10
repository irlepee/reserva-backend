-- CreateTable
CREATE TABLE "group" (
    "id" INTEGER NOT NULL,
    "id_owner" INTEGER NOT NULL,
    "name" VARCHAR(64) NOT NULL,
    "date_created" DATE NOT NULL,

    CONSTRAINT "group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification" (
    "id" BIGINT NOT NULL,
    "id_owner" BIGINT NOT NULL,
    "notification_type" SMALLINT NOT NULL,

    CONSTRAINT "notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_type" (
    "id" INTEGER NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "notification_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reserva" (
    "id" BIGINT NOT NULL,
    "id_owner" BIGINT NOT NULL,
    "id_resource" INTEGER NOT NULL,
    "start_date" TIMESTAMPTZ(0) NOT NULL,
    "end_date" TIMESTAMPTZ(0) NOT NULL,
    "status" BOOLEAN NOT NULL,
    "id_group" INTEGER,

    CONSTRAINT "reserva_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resource" (
    "id" INTEGER NOT NULL,
    "id_site" INTEGER NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "date_created" DATE NOT NULL,
    "resource_type" INTEGER NOT NULL,
    "status" BOOLEAN NOT NULL,

    CONSTRAINT "resource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resource_type" (
    "id" INTEGER NOT NULL,
    "name" VARCHAR(40) NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "resource_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "site" (
    "id" INTEGER NOT NULL,
    "id_owner" BIGINT NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "date_created" DATE NOT NULL,
    "id_estado" INTEGER NOT NULL,
    "id_municipio" INTEGER NOT NULL,
    "id_localidad" INTEGER NOT NULL,

    CONSTRAINT "site_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" BIGSERIAL NOT NULL,
    "username" VARCHAR(24) NOT NULL,
    "name" VARCHAR(50),
    "lastname" VARCHAR(50),
    "age" SMALLINT,
    "gender" CHAR,
    "email" VARCHAR(50) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "id_estado" INTEGER,
    "id_municipio" INTEGER,
    "id_localidad" INTEGER,
    "emailConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "confirmationToken" TEXT,
    "createdAt" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_group" (
    "id_user" BIGINT NOT NULL,
    "id_group" INTEGER NOT NULL,

    CONSTRAINT "user_group_pkey" PRIMARY KEY ("id_user","id_group")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");
