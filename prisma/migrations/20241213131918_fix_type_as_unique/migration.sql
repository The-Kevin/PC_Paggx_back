/*
  Warnings:

  - A unique constraint covering the columns `[type]` on the table `IdentificationType` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "IdentificationType_type_key" ON "IdentificationType"("type");
