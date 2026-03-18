/*
  Warnings:

  - The `matricula` column on the `clientes` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "clientes" DROP COLUMN "matricula",
ADD COLUMN     "matricula" INTEGER;
