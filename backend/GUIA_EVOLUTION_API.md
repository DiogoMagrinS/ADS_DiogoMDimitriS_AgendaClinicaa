# 📱 Guia Completo - Integração Evolution API WhatsApp

## 🎯 O que foi implementado

Sistema completo de notificações via WhatsApp usando Evolution API que envia automaticamente:

1. ✅ **Agendamento Criado** - Quando paciente cria um agendamento
2. ✅ **Agendamento Cancelado** - Quando paciente ou recepcionista cancela
3. ✅ **Agendamento Atualizado** - Quando data/hora é alterada
4. ✅ **Agendamento Confirmado** - Quando status muda para CONFIRMADO
5. ✅ **Atendimento Finalizado** - Quando profissional finaliza (com observações)
6. ✅ **Lembretes Automáticos** - 24h antes do agendamento

## 🚀 Como Configurar

### Passo 1: Instalar Evolution API

#### Opção A: Docker (Recomendado)
```bash
docker run -d \
  --name evolution-api \
  -p 8080:8080 \
  -e AUTHENTICATION_API_KEY=sua_api_key_segura_aqui \
  atendai/evolution-api:latest
```

#### Opção B: NPM Global
```bash
npm install -g @evolution-api/api
```

### Passo 2: Configurar Variáveis de Ambiente

Adicione no arquivo `.env` do backend:

```env
# Evolution API Configuration
EVOLUTION_API_URL="http://localhost:8080"
EVOLUTION_API_KEY="sua_api_key_segura_aqui"
EVOLUTION_INSTANCE_NAME="default"
```

### Passo 3: Criar Instância no WhatsApp

1. Acesse: `http://localhost:8080` (ou sua URL da Evolution API)
2. Crie uma nova instância com o nome configurado
3. Escaneie o QR Code com seu WhatsApp
4. Aguarde a conexão ser estabelecida

### Passo 4: Testar

O sistema já está configurado! As notificações serão enviadas automaticamente quando:
- Um agendamento for criado
- Um agendamento for cancelado
- Um agendamento for atualizado
- Um agendamento for confirmado
- Um agendamento for finalizado

## 📋 Funcionalidades da Evolution API Disponíveis

### ✅ Implementadas

1. **Enviar Mensagem de Texto**
   - Formatação automática de números
   - Templates de mensagens personalizados
   - Registro de status no banco

2. **Templates de Mensagens**
   - Mensagens formatadas com emojis
   - Informações estruturadas
   - Diferentes tipos por evento

### 🔧 Disponíveis para Implementar

1. **Enviar Imagens**
   ```typescript
   await whatsappService.enviarImagem(
     "5511999999999",
     "https://exemplo.com/imagem.jpg",
     "Legenda"
   );
   ```

2. **Enviar Documentos**
   - PDFs, documentos, etc.

3. **Enviar Áudios/Vídeos**
   - Mensagens de voz
   - Vídeos explicativos

4. **Mensagens com Template (Oficial)**
   - Para números não salvos
   - Aprovados pelo WhatsApp Business

5. **Webhooks**
   - Receber mensagens dos pacientes
   - Responder automaticamente
   - Chatbot integrado

6. **Status de Entrega**
   - Verificar se mensagem foi entregue
   - Verificar se foi lida

## 📝 Formato de Números

O sistema formata automaticamente:
- ✅ `(11) 99999-9999` → `5511999999999`
- ✅ `11999999999` → `5511999999999`
- ✅ `5511999999999` → `5511999999999` (já correto)

**Importante:** Números devem incluir código do país (55 para Brasil)

## 🔄 Lembretes Automáticos

Para ativar lembretes automáticos, adicione um cron job:

```typescript
// Exemplo usando node-cron
import cron from 'node-cron';
import { enviarLembretesAgendamentos } from './services/notificacaoService';

// Executa a cada hora
cron.schedule('0 * * * *', async () => {
  await enviarLembretesAgendamentos();
});
```

## 🛠️ Troubleshooting

### Erro: "Instance not found"
- Verifique se a instância foi criada na Evolution API
- Confirme o nome da instância no `.env`
- Verifique se o WhatsApp está conectado

### Erro: "Invalid phone number"
- Verifique se o número está no formato internacional
- Certifique-se de incluir código do país (55 para Brasil)
- Remova espaços e caracteres especiais

### Mensagens não estão sendo enviadas
- Verifique se o WhatsApp está conectado
- Confirme se a API Key está correta
- Verifique os logs da Evolution API
- Verifique se o usuário tem telefone cadastrado

### Prisma Client não reconhece modelo
- Execute: `npx prisma generate`
- Reinicie o servidor TypeScript
- Verifique se a migration foi aplicada

## 📚 Documentação Oficial

- **GitHub:** https://github.com/EvolutionAPI/evolution-api
- **Documentação:** https://doc.evolution-api.com/
- **Discord:** https://discord.gg/evolutionapi

## 🔐 Segurança

⚠️ **Importante:**
- Nunca exponha sua API Key publicamente
- Use HTTPS em produção
- Configure firewall adequadamente
- Monitore o uso da API
- Armazene API Key em variáveis de ambiente

## 📊 Monitoramento

As notificações são registradas no banco de dados na tabela `Notificacao` com:
- Status (CRIADA, ENVIADA, FALHOU)
- Detalhes de erro (se houver)
- Timestamp de criação
- Metadados do agendamento

Isso permite rastrear todas as notificações enviadas!

