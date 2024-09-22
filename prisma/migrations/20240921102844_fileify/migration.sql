/*
  Warnings:

  - You are about to drop the column `url` on the `Entity` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Entity" DROP COLUMN "url",
ADD COLUMN     "filename" TEXT,
ADD COLUMN     "path" TEXT;
