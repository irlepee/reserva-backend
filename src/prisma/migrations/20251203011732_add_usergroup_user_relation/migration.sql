-- AlterTable
ALTER TABLE "User" ALTER COLUMN "gender" SET DATA TYPE CHAR;

-- AddForeignKey
ALTER TABLE "UserGroup" ADD CONSTRAINT "UserGroup_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
