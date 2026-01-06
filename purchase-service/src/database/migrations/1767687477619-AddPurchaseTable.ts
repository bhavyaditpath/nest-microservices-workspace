import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPurchaseTable1767687477619 implements MigrationInterface {
    name = 'AddPurchaseTable1767687477619'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "purchases" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "createdBy" integer, "updatedBy" integer, "isRemoved" boolean NOT NULL DEFAULT false, "productName" character varying(255) NOT NULL, "quantity" numeric(10,2) NOT NULL, "unit" character varying(50) NOT NULL, "pricePerUnit" numeric(10,2) NOT NULL, "totalPrice" numeric(10,2) NOT NULL, "lowStockThreshold" integer NOT NULL, "brand" character varying(255) NOT NULL, "userId" integer NOT NULL, "branchId" integer, CONSTRAINT "PK_1d55032f37a34c6eceacbbca6b8" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "purchases"`);
    }

}
