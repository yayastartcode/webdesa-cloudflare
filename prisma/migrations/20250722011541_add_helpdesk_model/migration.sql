-- CreateTable
CREATE TABLE "helpdesk" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "nomorWhatsapp" TEXT NOT NULL,
    "kategoriPengaduan" TEXT NOT NULL,
    "pesanPengaduan" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "response" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "helpdesk_pkey" PRIMARY KEY ("id")
);
