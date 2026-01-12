import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProductNameToRequest1767947039722 implements MigrationInterface {
    name = 'AddProductNameToRequest1767947039722'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "requests" ADD "productName" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "requests" DROP COLUMN "productName"`);
    }

}