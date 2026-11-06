-- CreateTable
CREATE TABLE "population_data" (
    "id" TEXT NOT NULL,
    "totalPopulation" INTEGER NOT NULL,
    "malePopulation" INTEGER NOT NULL,
    "femalePopulation" INTEGER NOT NULL,
    "households" INTEGER NOT NULL,
    "temporaryResidents" INTEGER NOT NULL,
    "populationMutations" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "population_data_pkey" PRIMARY KEY ("id")
);
