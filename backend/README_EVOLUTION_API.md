# Integração com Evolution API - WhatsApp

## 📋 Sobre a Evolution API

A Evolution API é uma solução open-source para integração com WhatsApp que permite:
- ✅ Enviar mensagens de texto
- ✅ Enviar mídias (imagens, documentos, áudios, vídeos)
- ✅ Enviar mensagens com templates (para números não salvos)
- ✅ Criar e gerenciar múltiplas instâncias
- ✅ Webhooks para receber mensagens
- ✅ Status de entrega e leitura
- ✅ Gerenciar contatos e grupos

## 🚀 Como Configurar

### 1. Instalar Evolution API

Você pode instalar a Evolution API de duas formas:

#### Opção A: Docker (Recomendado)
```bash
docker run -d \
  --name evolution-api \
  -p 8080:8080 \
  -e AUTHENTICATION_API_KEY=sua_api_key_aqui \
  atendai/evolution-api:latest
```

#### Opção B: NPM
```bash
npm install -g @evolution-api/api
```

### 2. Configurar Variáveis de Ambiente

Adicione no seu arquivo `.env`:

```env
EVOLUTION_API_URL="http://localhost:8080"
EVOLUTION_API_KEY="sua_api_key_aqui"
EVOLUTION_INSTANCE_NAME="default"
```

### 3. Criar Instância no WhatsApp

1. Acesse a interface da Evolution API: `http://localhost:8080`
2. Crie uma nova instância
3. Escaneie o QR Code com seu WhatsApp
4. Aguarde a conexão ser estabelecida

### 4. Testar a Integração

O sistema já está configurado para enviar notificações automaticamente quando:
- ✅ Um agendamento é criado
- ✅ Um agendamento é cancelado
- ✅ Um agendamento é atualizado
- ✅ Um agendamento é confirmado
- ✅ Um agendamento é finalizado
- ✅ Lembretes automáticos (24h antes)

## 📱 Tipos de Notificações Implementadas

### 1. Agendamento Criado
```
✅ Agendamento Confirmado

Seu agendamento foi marcado com sucesso!

📅 Data/Hora: [data]
👨‍⚕️ Profissional: [nome]

Lembre-se de comparecer no horário agendado.
```

### 2. Agendamento Cancelado
```
❌ Agendamento Cancelado

Seu agendamento do dia [data] foi cancelado.

Se precisar reagendar, entre em contato conosco.
```

### 3. Agendamento Atualizado
```
🔄 Agendamento Atualizado

Seu agendamento foi alterado:

📅 Data Anterior: [data antiga]
📅 Nova Data: [nova data]

Por favor, confirme sua presença na nova data.
```

### 4. Lembrete (24h antes)
```
⏰ Lembrete de Agendamento

Você tem um agendamento em breve:

📅 Data/Hora: [data]
👨‍⚕️ Profissional: [nome]

Não se esqueça de comparecer!
```

### 5. Atendimento Finalizado
```
✅ Atendimento Finalizado

Seu atendimento com [profissional] foi finalizado.

📝 Observações do Profissional:
[observações]

Avalie seu atendimento através do nosso sistema.
```

## 🔧 Funcionalidades da Evolution API Disponíveis

### Enviar Mensagem de Texto
```typescript
await whatsappService.enviarMensagemTexto({
  numero: "5511999999999",
  mensagem: "Sua mensagem aqui"
});
```

### Enviar Mensagem com Template
```typescript
await whatsappService.enviarMensagemTemplate(
  "5511999999999",
  "nome_do_template",
  componentes
);
```

### Enviar Imagem
```typescript
await whatsappService.enviarImagem(
  "5511999999999",
  "https://exemplo.com/imagem.jpg",
  "Legenda da imagem"
);
```

### Verificar Status da Mensagem
```typescript
const status = await whatsappService.verificarStatusMensagem(messageId);
```

## 📝 Formato de Número

Os números devem estar no formato internacional:
- ✅ Correto: `5511999999999` (código do país + DDD + número)
- ❌ Incorreto: `(11) 99999-9999` ou `11999999999`

O sistema formata automaticamente os números.

## 🔄 Lembretes Automáticos

Para ativar lembretes automáticos, você pode criar um cron job ou usar uma biblioteca como `node-cron`:

```typescript
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

### Erro: "Invalid phone number"
- Verifique se o número está no formato internacional
- Certifique-se de que o número inclui o código do país (55 para Brasil)

### Mensagens não estão sendo enviadas
- Verifique se o WhatsApp está conectado
- Confirme se a API Key está correta
- Verifique os logs da Evolution API

## 📚 Documentação Oficial

- [Evolution API GitHub](https://github.com/EvolutionAPI/evolution-api)
- [Documentação Completa](https://doc.evolution-api.com/)

## 🔐 Segurança

- ⚠️ Nunca exponha sua API Key publicamente
- ⚠️ Use HTTPS em produção
- ⚠️ Configure firewall adequadamente
- ⚠️ Monitore o uso da API

