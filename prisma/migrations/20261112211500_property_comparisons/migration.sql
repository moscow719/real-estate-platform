-- CreateEnum
CREATE TYPE "ComparisonSlot" AS ENUM ('FIRST', 'SECOND', 'THIRD', 'FOURTH');

-- CreateTable
CREATE TABLE "PropertyComparison" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "slot" "ComparisonSlot" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PropertyComparison_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PropertyComparison_userId_propertyId_key" ON "PropertyComparison"("userId", "propertyId");

-- CreateIndex
CREATE UNIQUE INDEX "PropertyComparison_userId_slot_key" ON "PropertyComparison"("userId", "slot");

-- AddForeignKey
ALTER TABLE "PropertyComparison" ADD CONSTRAINT "PropertyComparison_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyComparison" ADD CONSTRAINT "PropertyComparison_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;
