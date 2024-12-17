/*
  Warnings:

  - Added the required column `document` to the `Identification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `IdentificationType` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('CPF', 'CNPJ', 'CNH', 'PASSPORT');

-- AlterTable
ALTER TABLE "Identification" ADD COLUMN     "approved" BOOLEAN,
ADD COLUMN     "bigDecision" TEXT,
ADD COLUMN     "document" TEXT NOT NULL,
ADD COLUMN     "score" INTEGER;

-- AlterTable
ALTER TABLE "IdentificationType" ADD COLUMN     "type" "DocumentType" NOT NULL;
