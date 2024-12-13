-- CreateTable
CREATE TABLE "Identification" (
    "id" TEXT NOT NULL,

    CONSTRAINT "Identification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IdentificationType" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "IdentificationType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IdentificationTypeMetadata" (
    "id" TEXT NOT NULL,
    "page_title" TEXT NOT NULL,
    "page_description" TEXT,
    "page_image_link" TEXT NOT NULL,

    CONSTRAINT "IdentificationTypeMetadata_pkey" PRIMARY KEY ("id")
);
