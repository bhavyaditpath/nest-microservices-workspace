import { MigrationInterface, QueryRunner } from "typeorm";

export class MakePurchaseIdNullable1767947039721 implements MigrationInterface {
    name = 'MakePurchaseIdNullable1767947039721'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "requests" ALTER COLUMN "purchaseId" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "requests" ALTER COLUMN "purchaseId" SET NOT NULL`);
    }

}