-- CreateTable
CREATE TABLE "sales" (
    "id" SERIAL NOT NULL,
    "itemName" VARCHAR(100) NOT NULL,
    "amount" INTEGER NOT NULL,
    "soldAt" TIMESTAMPTZ(6) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sales_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sales_soldAt_idx" ON "sales"("soldAt");
