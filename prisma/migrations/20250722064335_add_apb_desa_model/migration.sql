-- CreateTable
CREATE TABLE "apb_desa" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "pendapatanDesa" DECIMAL(15,2) NOT NULL,
    "belanjaDesa" DECIMAL(15,2) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "apb_desa_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "apb_desa_year_key" ON "apb_desa"("year");
