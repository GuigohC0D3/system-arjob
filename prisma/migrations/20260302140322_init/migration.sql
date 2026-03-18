-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "criado_em" TIMESTAMP(6),
    "ativo" BOOLEAN DEFAULT true,
    "status_id" INTEGER,
    "cargo_id" INTEGER,
    "otp_verificacao" BOOLEAN DEFAULT false,
    "otp_secret" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_cpf_key" ON "users"("cpf");

-- CreateIndex
CREATE INDEX "users_status_id_idx" ON "users"("status_id");

-- CreateIndex
CREATE INDEX "users_cargo_id_idx" ON "users"("cargo_id");
