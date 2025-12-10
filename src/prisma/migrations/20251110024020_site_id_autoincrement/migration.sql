-- AlterTable
CREATE SEQUENCE site_id_seq;
ALTER TABLE "site" ALTER COLUMN "id" SET DEFAULT nextval('site_id_seq');
ALTER SEQUENCE site_id_seq OWNED BY "site"."id";

-- AlterTable
ALTER TABLE "user" ALTER COLUMN "gender" SET DATA TYPE CHAR;
