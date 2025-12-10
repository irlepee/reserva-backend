-- AlterTable
ALTER TABLE "User" ADD COLUMN     "email_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "email_verified_at" TIMESTAMP(3),
ADD COLUMN     "email_verify_token" TEXT,
ADD COLUMN     "email_verify_token_exp" TIMESTAMP(3),
ALTER COLUMN "gender" SET DATA TYPE CHAR;
