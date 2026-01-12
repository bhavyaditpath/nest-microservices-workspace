import { MigrationInterface, QueryRunner } from "typeorm";

export class Removeproductname1768200093039 implements MigrationInterface {
    name = 'Removeproductname1768200093039'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "requests" DROP COLUMN "productName"`);
        await queryRunner.query(`ALTER TABLE "requests" ALTER COLUMN "purchaseId" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "requests" ALTER COLUMN "purchaseId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "requests" ADD "productName" character varying`);
    }

}
