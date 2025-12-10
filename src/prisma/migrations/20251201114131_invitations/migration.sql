-- AlterTable
ALTER TABLE "User" ALTER COLUMN "gender" SET DATA TYPE CHAR;

-- CreateTable
CREATE TABLE "Invitation" (
    "id_user" BIGINT NOT NULL,
    "id_group" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Invitation_pkey" PRIMARY KEY ("id_user","id_group")
);

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_id_group_fkey" FOREIGN KEY ("id_group") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
