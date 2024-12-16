-- CreateEnum
CREATE TYPE "FileName" AS ENUM ('BACK_DOCUMENT_IMAGE', 'FRONT_DOCUMENT_IMAGE', 'SELF_IMAGE');

-- AlterTable
ALTER TABLE "Identification" ADD COLUMN     "identificationTypeId" TEXT;

-- CreateTable
CREATE TABLE "File" (
    "id" TEXT NOT NULL,
    "name" "FileName" NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "content" BYTEA NOT NULL,
    "identificationId" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "File_id_key" ON "File"("id");

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_identificationId_fkey" FOREIGN KEY ("identificationId") REFERENCES "Identification"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Identification" ADD CONSTRAINT "Identification_identificationTypeId_fkey" FOREIGN KEY ("identificationTypeId") REFERENCES "IdentificationType"("id") ON DELETE SET NULL ON UPDATE CASCADE;
