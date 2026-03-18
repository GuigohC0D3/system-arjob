/*
  Warnings:

  - You are about to drop the column `status` on the `mesas` table. All the data in the column will be lost.
  - You are about to alter the column `preco` on the `produtos` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - You are about to drop the `cargo` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `categorias` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "produtos" DROP CONSTRAINT "produtos_categoria_id_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_cargo_id_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_status_id_fkey";

-- AlterTable
ALTER TABLE "mesas" DROP COLUMN "status",
ADD COLUMN     "ocupada" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "produtos" ALTER COLUMN "preco" SET DATA TYPE DECIMAL(10,2);

-- DropTable
DROP TABLE "cargo";

-- DropTable
DROP TABLE "categorias";

-- DropTable
DROP TABLE "users";

-- CreateTable
CREATE TABLE "usuarios" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "cpf" VARCHAR(14) NOT NULL,
    "senha" VARCHAR(255) NOT NULL,
    "criado_em" TIMESTAMP(6),
    "ativo" BOOLEAN DEFAULT true,
    "status_id" INTEGER,
    "otp_verificacao" BOOLEAN DEFAULT false,
    "otp_secret" VARCHAR(255),

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cargos" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(50) NOT NULL,

    CONSTRAINT "cargos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cargo_usuario" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "cargo_id" INTEGER NOT NULL,

    CONSTRAINT "cargo_usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissoes" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(100) NOT NULL,

    CONSTRAINT "permissoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissoes_cargo" (
    "id" SERIAL NOT NULL,
    "cargo_id" INTEGER NOT NULL,
    "permissao_id" INTEGER NOT NULL,

    CONSTRAINT "permissoes_cargo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissoes_usuario" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "permissao_id" INTEGER NOT NULL,

    CONSTRAINT "permissoes_usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categoria_produto" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(100) NOT NULL,

    CONSTRAINT "categoria_produto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clientes" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "cpf" VARCHAR(14),
    "email" VARCHAR(150),
    "telefone" VARCHAR(20),
    "status_id" INTEGER,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "convenio" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(100) NOT NULL,

    CONSTRAINT "convenio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "convenio_cliente" (
    "id" SERIAL NOT NULL,
    "convenio_id" INTEGER NOT NULL,
    "cliente_id" INTEGER NOT NULL,

    CONSTRAINT "convenio_cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departamento" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(100) NOT NULL,

    CONSTRAINT "departamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departamento_cliente" (
    "id" SERIAL NOT NULL,
    "departamento_id" INTEGER NOT NULL,
    "cliente_id" INTEGER NOT NULL,

    CONSTRAINT "departamento_cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comandas" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "cliente_id" INTEGER,
    "aberta_em" TIMESTAMP(6),
    "fechada_em" TIMESTAMP(6),

    CONSTRAINT "comandas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mesa_comanda" (
    "id" SERIAL NOT NULL,
    "mesa_id" INTEGER NOT NULL,
    "comanda_id" INTEGER NOT NULL,

    CONSTRAINT "mesa_comanda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "itens_comanda" (
    "id" SERIAL NOT NULL,
    "comanda_id" INTEGER NOT NULL,
    "observacao" VARCHAR(255),

    CONSTRAINT "itens_comanda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "itens_comanda_produtos_quantidade" (
    "id" SERIAL NOT NULL,
    "item_comanda_id" INTEGER NOT NULL,
    "produto_id" INTEGER NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "preco_unitario" DECIMAL(10,2),

    CONSTRAINT "itens_comanda_produtos_quantidade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historico_comandas" (
    "id" SERIAL NOT NULL,
    "comanda_id" INTEGER NOT NULL,
    "descricao" VARCHAR(255) NOT NULL,
    "criado_em" TIMESTAMP(6),

    CONSTRAINT "historico_comandas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historico_precos" (
    "id" SERIAL NOT NULL,
    "produto_id" INTEGER NOT NULL,
    "preco_anterior" DECIMAL(10,2),
    "preco_novo" DECIMAL(10,2),
    "criado_em" TIMESTAMP(6),

    CONSTRAINT "historico_precos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "logs_atendimentos" (
    "id" SERIAL NOT NULL,
    "descricao" VARCHAR(255) NOT NULL,
    "criado_em" TIMESTAMP(6),

    CONSTRAINT "logs_atendimentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movimentacao_caixa" (
    "id" SERIAL NOT NULL,
    "tipo" VARCHAR(50) NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "descricao" VARCHAR(255),
    "criado_em" TIMESTAMP(6),

    CONSTRAINT "movimentacao_caixa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tipos_pagamento" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(50) NOT NULL,

    CONSTRAINT "tipos_pagamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "relatorios" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "criado_em" TIMESTAMP(6),

    CONSTRAINT "relatorios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "status_cliente" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(50) NOT NULL,

    CONSTRAINT "status_cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_token_blacklist" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "expirado_em" TIMESTAMP(6),

    CONSTRAINT "refresh_token_blacklist_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_cpf_key" ON "usuarios"("cpf");

-- CreateIndex
CREATE INDEX "usuarios_status_id_idx" ON "usuarios"("status_id");

-- CreateIndex
CREATE INDEX "cargo_usuario_usuario_id_idx" ON "cargo_usuario"("usuario_id");

-- CreateIndex
CREATE INDEX "cargo_usuario_cargo_id_idx" ON "cargo_usuario"("cargo_id");

-- CreateIndex
CREATE INDEX "permissoes_cargo_cargo_id_idx" ON "permissoes_cargo"("cargo_id");

-- CreateIndex
CREATE INDEX "permissoes_cargo_permissao_id_idx" ON "permissoes_cargo"("permissao_id");

-- CreateIndex
CREATE INDEX "permissoes_usuario_usuario_id_idx" ON "permissoes_usuario"("usuario_id");

-- CreateIndex
CREATE INDEX "permissoes_usuario_permissao_id_idx" ON "permissoes_usuario"("permissao_id");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_cpf_key" ON "clientes"("cpf");

-- CreateIndex
CREATE INDEX "clientes_status_id_idx" ON "clientes"("status_id");

-- CreateIndex
CREATE INDEX "convenio_cliente_convenio_id_idx" ON "convenio_cliente"("convenio_id");

-- CreateIndex
CREATE INDEX "convenio_cliente_cliente_id_idx" ON "convenio_cliente"("cliente_id");

-- CreateIndex
CREATE INDEX "departamento_cliente_departamento_id_idx" ON "departamento_cliente"("departamento_id");

-- CreateIndex
CREATE INDEX "departamento_cliente_cliente_id_idx" ON "departamento_cliente"("cliente_id");

-- CreateIndex
CREATE UNIQUE INDEX "comandas_code_key" ON "comandas"("code");

-- CreateIndex
CREATE INDEX "comandas_cliente_id_idx" ON "comandas"("cliente_id");

-- CreateIndex
CREATE INDEX "mesa_comanda_mesa_id_idx" ON "mesa_comanda"("mesa_id");

-- CreateIndex
CREATE INDEX "mesa_comanda_comanda_id_idx" ON "mesa_comanda"("comanda_id");

-- CreateIndex
CREATE INDEX "itens_comanda_comanda_id_idx" ON "itens_comanda"("comanda_id");

-- CreateIndex
CREATE INDEX "itens_comanda_produtos_quantidade_item_comanda_id_idx" ON "itens_comanda_produtos_quantidade"("item_comanda_id");

-- CreateIndex
CREATE INDEX "itens_comanda_produtos_quantidade_produto_id_idx" ON "itens_comanda_produtos_quantidade"("produto_id");

-- CreateIndex
CREATE INDEX "historico_comandas_comanda_id_idx" ON "historico_comandas"("comanda_id");

-- CreateIndex
CREATE INDEX "historico_precos_produto_id_idx" ON "historico_precos"("produto_id");

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "status"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cargo_usuario" ADD CONSTRAINT "cargo_usuario_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cargo_usuario" ADD CONSTRAINT "cargo_usuario_cargo_id_fkey" FOREIGN KEY ("cargo_id") REFERENCES "cargos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permissoes_cargo" ADD CONSTRAINT "permissoes_cargo_cargo_id_fkey" FOREIGN KEY ("cargo_id") REFERENCES "cargos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permissoes_cargo" ADD CONSTRAINT "permissoes_cargo_permissao_id_fkey" FOREIGN KEY ("permissao_id") REFERENCES "permissoes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permissoes_usuario" ADD CONSTRAINT "permissoes_usuario_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permissoes_usuario" ADD CONSTRAINT "permissoes_usuario_permissao_id_fkey" FOREIGN KEY ("permissao_id") REFERENCES "permissoes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produtos" ADD CONSTRAINT "produtos_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categoria_produto"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "status"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "convenio_cliente" ADD CONSTRAINT "convenio_cliente_convenio_id_fkey" FOREIGN KEY ("convenio_id") REFERENCES "convenio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "convenio_cliente" ADD CONSTRAINT "convenio_cliente_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "departamento_cliente" ADD CONSTRAINT "departamento_cliente_departamento_id_fkey" FOREIGN KEY ("departamento_id") REFERENCES "departamento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "departamento_cliente" ADD CONSTRAINT "departamento_cliente_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comandas" ADD CONSTRAINT "comandas_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mesa_comanda" ADD CONSTRAINT "mesa_comanda_mesa_id_fkey" FOREIGN KEY ("mesa_id") REFERENCES "mesas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mesa_comanda" ADD CONSTRAINT "mesa_comanda_comanda_id_fkey" FOREIGN KEY ("comanda_id") REFERENCES "comandas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_comanda" ADD CONSTRAINT "itens_comanda_comanda_id_fkey" FOREIGN KEY ("comanda_id") REFERENCES "comandas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_comanda_produtos_quantidade" ADD CONSTRAINT "itens_comanda_produtos_quantidade_item_comanda_id_fkey" FOREIGN KEY ("item_comanda_id") REFERENCES "itens_comanda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_comanda_produtos_quantidade" ADD CONSTRAINT "itens_comanda_produtos_quantidade_produto_id_fkey" FOREIGN KEY ("produto_id") REFERENCES "produtos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historico_comandas" ADD CONSTRAINT "historico_comandas_comanda_id_fkey" FOREIGN KEY ("comanda_id") REFERENCES "comandas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historico_precos" ADD CONSTRAINT "historico_precos_produto_id_fkey" FOREIGN KEY ("produto_id") REFERENCES "produtos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
