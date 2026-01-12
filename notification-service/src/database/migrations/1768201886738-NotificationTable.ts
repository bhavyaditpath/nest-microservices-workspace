import { MigrationInterface, QueryRunner } from "typeorm";

export class NotificationTable1768201886738 implements MigrationInterface {
    name = 'NotificationTable1768201886738'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."notifications_type_enum" AS ENUM('branch', 'system', 'user')`);
        await queryRunner.query(`CREATE TABLE "notifications" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "createdBy" integer, "updatedBy" integer, "isRemoved" boolean NOT NULL DEFAULT false, "title" character varying(255) NOT NULL, "message" text NOT NULL, "type" "public"."notifications_type_enum" NOT NULL, "userId" integer, "branchId" integer, CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_notifications" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "createdBy" integer, "updatedBy" integer, "isRemoved" boolean NOT NULL DEFAULT false, "userId" integer NOT NULL, "notificationId" integer NOT NULL, "read" boolean NOT NULL DEFAULT false, CONSTRAINT "UQ_1684fc4d342234900b518bcab1c" UNIQUE ("userId", "notificationId"), CONSTRAINT "PK_569622b0fd6e6ab3661de985a2b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user_notifications" ADD CONSTRAINT "FK_01a2c65f414d36cfe6f5d950fb2" FOREIGN KEY ("notificationId") REFERENCES "notifications"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_notifications" DROP CONSTRAINT "FK_01a2c65f414d36cfe6f5d950fb2"`);
        await queryRunner.query(`DROP TABLE "user_notifications"`);
        await queryRunner.query(`DROP TABLE "notifications"`);
        await queryRunner.query(`DROP TYPE "public"."notifications_type_enum"`);
    }

}
