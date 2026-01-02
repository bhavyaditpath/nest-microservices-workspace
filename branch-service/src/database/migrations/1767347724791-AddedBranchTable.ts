import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedBranchTable1767347724791 implements MigrationInterface {
    name = 'AddedBranchTable1767347724791'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "branches" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "createdBy" integer, "updatedBy" integer, "isRemoved" boolean NOT NULL DEFAULT false, "name" character varying NOT NULL, "address" character varying, "phone" character varying, CONSTRAINT "UQ_8387ed27b3d4ca53ec3fc7b029c" UNIQUE ("name"), CONSTRAINT "PK_7f37d3b42defea97f1df0d19535" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "branches"`);
    }

}
