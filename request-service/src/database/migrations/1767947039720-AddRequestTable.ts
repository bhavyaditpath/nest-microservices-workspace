import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRequestTable1767947039720 implements MigrationInterface {
    name = 'AddRequestTable1767947039720'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."requests_status_enum" AS ENUM('Request', 'Accept', 'Reject', 'InTransit', 'Delivered')`);
        await queryRunner.query(`CREATE TABLE "requests" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "createdBy" integer, "updatedBy" integer, "isRemoved" boolean NOT NULL DEFAULT false, "requestingUserId" integer NOT NULL, "adminUserId" integer NOT NULL, "purchaseId" integer NOT NULL, "status" "public"."requests_status_enum" NOT NULL DEFAULT 'Request', "quantityRequested" numeric(10,2) NOT NULL, "notes" text, CONSTRAINT "PK_0428f484e96f9e6a55955f29b5f" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "requests"`);
        await queryRunner.query(`DROP TYPE "public"."requests_status_enum"`);
    }

}
