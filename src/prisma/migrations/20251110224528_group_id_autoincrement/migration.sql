-- AlterTable
CREATE SEQUENCE group_id_seq;
ALTER TABLE "Group" ALTER COLUMN "id" SET DEFAULT nextval('group_id_seq');
ALTER SEQUENCE group_id_seq OWNED BY "Group"."id";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "gender" SET DATA TYPE CHAR;
