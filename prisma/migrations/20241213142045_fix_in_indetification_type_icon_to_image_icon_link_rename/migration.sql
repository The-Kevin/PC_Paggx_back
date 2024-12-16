/*
  Warnings:

  - You are about to drop the column `icon` on the `IdentificationType` table. All the data in the column will be lost.
  - Added the required column `imageIconLink` to the `IdentificationType` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "IdentificationType" DROP COLUMN "icon",
ADD COLUMN     "imageIconLink" TEXT NOT NULL;
