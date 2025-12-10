-- AlterTable
CREATE SEQUENCE resource_id_seq;
ALTER TABLE "Resource" ALTER COLUMN "id" SET DEFAULT nextval('resource_id_seq'),
ALTER COLUMN "date_created" SET DEFAULT CURRENT_TIMESTAMP;
ALTER SEQUENCE resource_id_seq OWNED BY "Resource"."id";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "gender" SET DATA TYPE CHAR;

-- AddForeignKey
ALTER TABLE "Resource" ADD CONSTRAINT "Resource_id_site_fkey" FOREIGN KEY ("id_site") REFERENCES "Site"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resource" ADD CONSTRAINT "Resource_resource_type_fkey" FOREIGN KEY ("resource_type") REFERENCES "ResourceType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
