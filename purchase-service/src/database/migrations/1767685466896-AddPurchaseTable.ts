import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPurchaseTable1767685466896 implements MigrationInterface {
    name = 'AddPurchaseTable1767685466896'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "purchases" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "createdBy" integer, "updatedBy" integer, "isRemoved" boolean NOT NULL DEFAULT false, "productName" character varying NOT NULL, "description" character varying, "quantity" character varying, CONSTRAINT "UQ_426ee0cbaaafa2b31ab84af9d24" UNIQUE ("productName"), CONSTRAINT "PK_1d55032f37a34c6eceacbbca6b8" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "purchases"`);
    }

}
