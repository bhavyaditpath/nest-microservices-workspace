import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1769148871240 implements MigrationInterface {
    name = 'Migrations1769148871240'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."alerts_priority_enum" AS ENUM('low', 'medium', 'high', 'critical')`);
        await queryRunner.query(`CREATE TYPE "public"."alerts_alerttype_enum" AS ENUM('low_stock', 'out_of_stock')`);
        await queryRunner.query(`CREATE TYPE "public"."alerts_status_enum" AS ENUM('active', 'resolved', 'dismissed')`);
        await queryRunner.query(`CREATE TABLE "alerts" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "isRemoved" boolean DEFAULT false, "itemName" character varying(255) NOT NULL, "currentStock" numeric(10,2) NOT NULL, "minStock" integer NOT NULL, "shortage" numeric(10,2) NOT NULL, "priority" "public"."alerts_priority_enum" NOT NULL DEFAULT 'low', "alertType" "public"."alerts_alerttype_enum" NOT NULL, "status" "public"."alerts_status_enum" NOT NULL DEFAULT 'active', "resolvedDate" TIMESTAMP, "notes" text, "branchId" integer NOT NULL, CONSTRAINT "PK_60f895662df096bfcdfab7f4b96" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "alerts"`);
        await queryRunner.query(`DROP TYPE "public"."alerts_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."alerts_alerttype_enum"`);
        await queryRunner.query(`DROP TYPE "public"."alerts_priority_enum"`);
    }

}
