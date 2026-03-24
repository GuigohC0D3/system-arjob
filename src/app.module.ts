import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { SecurityModule } from './auth/security.module';
import { CargosModule } from './cargos/cargos.module';
import { CategoriasProdutosModule } from './categorias-produtos/categorias-produtos.module';
import { ClientesModule } from './clientes/clientes.module';
import { ComandasModule } from './comandas/comandas.module';
import { ConveniosModule } from './convenios/convenios.module';
import { DepartamentosModule } from './departamentos/departamentos.module';
import { MesasModule } from './mesas/mesas.module';
import { MovimentacaoCaixaModule } from './movimentacao-caixa/movimentacao-caixa.module';
import { LogsAtendimentoModule } from './logs-atendimento/logs-atendimento.module';
import { AllExceptionsFilter } from './logging/all-exceptions.filter';
import { FileLoggerService } from './logging/file-logger.service';
import { HttpLoggingInterceptor } from './logging/http-logging.interceptor';
import { PermissoesModule } from './permissoes/permissoes.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProdutosModule } from './produtos/produtos.module';
import { RelatoriosModule } from './relatorios/relatorios.module';
import { StatusModule } from './status/status.module';
import { StatusClienteModule } from './status-cliente/status-cliente.module';
import { TiposPagamentoModule } from './tipos-pagamento/tipos-pagamento.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    AuthModule,
    SecurityModule,
    CargosModule,
    CategoriasProdutosModule,
    ClientesModule,
    ConfigModule.forRoot({ isGlobal: true }),
    ComandasModule,
    ConveniosModule,
    DepartamentosModule,
    LogsAtendimentoModule,
    MesasModule,
    MovimentacaoCaixaModule,
    PermissoesModule,
    PrismaModule,
    ProdutosModule,
    RelatoriosModule,
    StatusModule,
    StatusClienteModule,
    TiposPagamentoModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    FileLoggerService,
    HttpLoggingInterceptor,
    AllExceptionsFilter,
  ],
})
export class AppModule {}
