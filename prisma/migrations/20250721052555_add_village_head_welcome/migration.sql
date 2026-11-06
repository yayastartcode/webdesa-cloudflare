-- CreateTable
CREATE TABLE "village_head_welcome" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "village_head_welcome_pkey" PRIMARY KEY ("id")
);
