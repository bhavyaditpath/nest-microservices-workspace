import { MigrationInterface, QueryRunner } from "typeorm";

export class BaseinUserAuth1767347945544 implements MigrationInterface {
    name = 'BaseinUserAuth1767347945544'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "users" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "users" ADD "createdBy" integer`);
        await queryRunner.query(`ALTER TABLE "users" ADD "updatedBy" integer`);
        await queryRunner.query(`ALTER TABLE "users" ADD "isRemoved" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "isRemoved"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "updatedBy"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "createdBy"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "createdAt"`);
    }

}
