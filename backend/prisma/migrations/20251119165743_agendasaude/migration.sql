/*
  Warnings:

  - You are about to drop the `Notificacao` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Notificacao" DROP CONSTRAINT "Notificacao_agendamentoId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Notificacao" DROP CONSTRAINT "Notificacao_destinatarioId_fkey";

-- DropTable
DROP TABLE "public"."Notificacao";

-- DropEnum
DROP TYPE "public"."CanalNotificacao";

-- DropEnum
DROP TYPE "public"."StatusNotificacao";

-- DropEnum
DROP TYPE "public"."TipoNotificacao";
