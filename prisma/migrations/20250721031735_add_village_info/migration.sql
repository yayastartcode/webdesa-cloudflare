-- CreateTable
CREATE TABLE "village_info" (
    "id" TEXT NOT NULL,
    "visi" TEXT NOT NULL,
    "misi" TEXT NOT NULL,
    "tujuan" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "village_info_pkey" PRIMARY KEY ("id")
);
