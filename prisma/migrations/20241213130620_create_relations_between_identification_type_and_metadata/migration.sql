-- AlterTable
ALTER TABLE "IdentificationType" ADD COLUMN     "identificationTypeMetadataId" TEXT;

-- AddForeignKey
ALTER TABLE "IdentificationType" ADD CONSTRAINT "IdentificationType_identificationTypeMetadataId_fkey" FOREIGN KEY ("identificationTypeMetadataId") REFERENCES "IdentificationTypeMetadata"("id") ON DELETE SET NULL ON UPDATE CASCADE;
