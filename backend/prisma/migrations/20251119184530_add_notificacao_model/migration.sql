-- CreateEnum
CREATE TYPE "TipoNotificacao" AS ENUM ('LEMBRETE', 'CANCELAMENTO', 'EDICAO', 'POS_CONSULTA', 'CONFIRMACAO_PRESENCA');

-- CreateEnum
CREATE TYPE "CanalNotificacao" AS ENUM ('WHATSAPP');

-- CreateEnum
CREATE TYPE "StatusNotificacao" AS ENUM ('CRIADA', 'ENVIADA', 'AGENDADA', 'FALHOU');

-- CreateTable
CREATE TABLE "Notificacao" (
    "id" SERIAL NOT NULL,
    "tipo" "TipoNotificacao" NOT NULL,
    "canal" "CanalNotificacao" NOT NULL,
    "destinatarioId" INTEGER NOT NULL,
    "destinatarioTipo" "TipoUsuario" NOT NULL,
    "conteudo" TEXT NOT NULL,
    "meta" JSONB NOT NULL DEFAULT '{}',
    "status" "StatusNotificacao" NOT NULL,
    "detalhesErro" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "agendamentoId" INTEGER,

    CONSTRAINT "Notificacao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notificacao_destinatarioId_idx" ON "Notificacao"("destinatarioId");

-- CreateIndex
CREATE INDEX "Notificacao_agendamentoId_idx" ON "Notificacao"("agendamentoId");

-- CreateIndex
CREATE INDEX "Notificacao_status_idx" ON "Notificacao"("status");

-- AddForeignKey
ALTER TABLE "Notificacao" ADD CONSTRAINT "Notificacao_destinatarioId_fkey" FOREIGN KEY ("destinatarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notificacao" ADD CONSTRAINT "Notificacao_agendamentoId_fkey" FOREIGN KEY ("agendamentoId") REFERENCES "Agendamento"("id") ON DELETE SET NULL ON UPDATE CASCADE;
