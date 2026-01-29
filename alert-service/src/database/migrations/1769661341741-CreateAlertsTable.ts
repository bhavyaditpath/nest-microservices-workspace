import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAlertsTable1769661341741 implements MigrationInterface {
    name = 'CreateAlertsTable1769661341741'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "alerts" ADD "createdBy" integer`);
        await queryRunner.query(`ALTER TABLE "alerts" ADD "updatedBy" integer`);
        await queryRunner.query(`ALTER TABLE "alerts" ALTER COLUMN "isRemoved" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "alerts" ALTER COLUMN "isRemoved" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "alerts" DROP COLUMN "updatedBy"`);
        await queryRunner.query(`ALTER TABLE "alerts" DROP COLUMN "createdBy"`);
    }

}
