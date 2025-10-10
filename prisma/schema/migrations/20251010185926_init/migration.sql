/*
  Warnings:

  - You are about to drop the `admins` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `doctors` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `patients` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."admins" DROP CONSTRAINT "admins_email_fkey";

-- DropForeignKey
ALTER TABLE "public"."doctors" DROP CONSTRAINT "doctors_email_fkey";

-- DropForeignKey
ALTER TABLE "public"."patients" DROP CONSTRAINT "patients_email_fkey";

-- DropTable
DROP TABLE "public"."admins";

-- DropTable
DROP TABLE "public"."doctors";

-- DropTable
DROP TABLE "public"."patients";

-- DropTable
DROP TABLE "public"."users";

-- DropEnum
DROP TYPE "public"."Gender";

-- DropEnum
DROP TYPE "public"."UserRole";

-- DropEnum
DROP TYPE "public"."UserStatus";

-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);
