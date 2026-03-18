-- AlterTable
ALTER TABLE "clientes" ADD COLUMN     "bloqueado" BOOLEAN,
ADD COLUMN     "consumido" DECIMAL(10,2),
ADD COLUMN     "convenio" VARCHAR(100),
ADD COLUMN     "criado_em" TIMESTAMP(6),
ADD COLUMN     "filial" VARCHAR(100),
ADD COLUMN     "limite" DECIMAL(10,2),
ADD COLUMN     "matricula" VARCHAR(50),
ADD COLUMN     "saldo" DECIMAL(10,2);
