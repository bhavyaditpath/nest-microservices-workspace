import { MigrationInterface, QueryRunner } from "typeorm";

export class Refreshtable1767347785891 implements MigrationInterface {
    name = 'Refreshtable1767347785891'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_299f0887c8389500e9ad14fecd"`);
        await queryRunner.query(`CREATE TABLE "refresh_tokens" ("id" SERIAL NOT NULL, "token" character varying NOT NULL, "userId" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "expiresAt" TIMESTAMP, "isRevoked" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_7d8bee0204106019488c4c50ffa" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "createdBy"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "updatedBy"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "isRemoved"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "branchId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" ADD CONSTRAINT "FK_610102b60fea1455310ccd299de" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP CONSTRAINT "FK_610102b60fea1455310ccd299de"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "branchId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ADD "isRemoved" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "users" ADD "updatedBy" integer`);
        await queryRunner.query(`ALTER TABLE "users" ADD "createdBy" integer`);
        await queryRunner.query(`ALTER TABLE "users" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "users" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`DROP TABLE "refresh_tokens"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_299f0887c8389500e9ad14fecd" ON "users" ("branchId", "username") `);
    }

}
