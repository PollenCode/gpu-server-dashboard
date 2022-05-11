-- CreateTable
CREATE TABLE "FederatedRuntime" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "containerId" TEXT,
    "port" INTEGER,

    CONSTRAINT "FederatedRuntime_pkey" PRIMARY KEY ("id")
);
