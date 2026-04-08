-- Fix 4: unique constraint em refresh_token_blacklist.token
-- Remove duplicatas mantendo o registro de menor id
DELETE FROM "refresh_token_blacklist"
WHERE id NOT IN (
  SELECT MIN(id) FROM "refresh_token_blacklist" GROUP BY token
);
CREATE UNIQUE INDEX "refresh_token_blacklist_token_key" ON "refresh_token_blacklist"("token");

-- Fix 5: tabela de rate limiting persistido
CREATE TABLE "rate_limit_entries" (
    "id" SERIAL NOT NULL,
    "chave" TEXT NOT NULL,
    "tentativas" INTEGER NOT NULL DEFAULT 0,
    "janela_de" TIMESTAMP(6) NOT NULL,
    CONSTRAINT "rate_limit_entries_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "rate_limit_entries_chave_key" ON "rate_limit_entries"("chave");

-- Fix 6: tabela de refresh tokens
CREATE TABLE "refresh_tokens" (
    "id" SERIAL NOT NULL,
    "token_hash" VARCHAR(64) NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "expirado_em" TIMESTAMP(6) NOT NULL,
    "criado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revogado" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "refresh_tokens_token_hash_key" ON "refresh_tokens"("token_hash");
CREATE INDEX "refresh_tokens_usuario_id_idx" ON "refresh_tokens"("usuario_id");
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_usuario_id_fkey"
    FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
