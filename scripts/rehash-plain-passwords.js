const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const BCRYPT_HASH_REGEX = /^\$2[aby]\$\d{2}\$/;

function loadDotEnv() {
  const envPath = path.join(__dirname, '..', '.env');

  if (!fs.existsSync(envPath)) {
    return;
  }

  const content = fs.readFileSync(envPath, 'utf8');

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

async function main() {
  loadDotEnv();

  const dryRun = process.argv.includes('--check');
  const prisma = new PrismaClient();

  try {
    const users = await prisma.usuario.findMany({
      select: {
        id: true,
        email: true,
        cpf: true,
        senha: true,
      },
      orderBy: {
        id: 'asc',
      },
    });

    const legacyUsers = users.filter((user) => !BCRYPT_HASH_REGEX.test(user.senha));

    if (legacyUsers.length === 0) {
      console.log('Nenhum usuário com senha em texto puro encontrado.');
      return;
    }

    console.log(
      `${legacyUsers.length} usuário(s) com senha em texto puro encontrado(s):`,
    );
    for (const user of legacyUsers) {
      console.log(`- id=${user.id} email=${user.email} cpf=${user.cpf}`);
    }

    if (dryRun) {
      console.log('Modo de verificação apenas. Nenhuma alteração foi aplicada.');
      return;
    }

    for (const user of legacyUsers) {
      const senhaHash = await bcrypt.hash(user.senha, 10);
      await prisma.usuario.update({
        where: { id: user.id },
        data: { senha: senhaHash },
      });
    }

    console.log(`${legacyUsers.length} senha(s) foram rehashadas com sucesso.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error('Falha ao rehashar senhas:', error);
  process.exit(1);
});
