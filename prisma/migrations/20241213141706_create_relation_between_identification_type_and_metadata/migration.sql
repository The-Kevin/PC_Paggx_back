/*
  Warnings:

  - You are about to drop the column `type` on the `IdentificationType` table. All the data in the column will be lost.
  - You are about to drop the column `page_image_link` on the `IdentificationTypeMetadata` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[id]` on the table `Identification` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `IdentificationType` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `IdentificationType` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `IdentificationTypeMetadata` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `icon` to the `IdentificationType` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `IdentificationType` table without a default value. This is not possible if the table is not empty.
  - Added the required column `page_image_card_link` to the `IdentificationTypeMetadata` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "IdentificationType" DROP COLUMN "type",
ADD COLUMN     "icon" TEXT NOT NULL,
ADD COLUMN     "identificationTypeMetadataId" TEXT,
ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "IdentificationTypeMetadata" DROP COLUMN "page_image_link",
ADD COLUMN     "page_image_card_link" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Identification_id_key" ON "Identification"("id");

-- CreateIndex
CREATE UNIQUE INDEX "IdentificationType_id_key" ON "IdentificationType"("id");

-- CreateIndex
CREATE UNIQUE INDEX "IdentificationType_name_key" ON "IdentificationType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "IdentificationTypeMetadata_id_key" ON "IdentificationTypeMetadata"("id");

-- AddForeignKey
ALTER TABLE "IdentificationType" ADD CONSTRAINT "IdentificationType_identificationTypeMetadataId_fkey" FOREIGN KEY ("identificationTypeMetadataId") REFERENCES "IdentificationTypeMetadata"("id") ON DELETE SET NULL ON UPDATE CASCADE;
