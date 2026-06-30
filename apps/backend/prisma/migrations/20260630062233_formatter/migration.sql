/*
  Warnings:

  - A unique constraint covering the columns `[number]` on the table `invoices` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `organizations` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "invoices" ADD COLUMN     "number" TEXT;

-- AlterTable
ALTER TABLE "organizations" ADD COLUMN     "code" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "invoices_number_key" ON "invoices"("number");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_code_key" ON "organizations"("code");
