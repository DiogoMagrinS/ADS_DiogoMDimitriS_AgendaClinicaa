import axios from 'axios';

interface EvolutionAPIConfig {
  baseURL: string;
  apiKey: string;
  instanceName: string;
}

interface EnviarMensagemParams {
  numero: string; // Número no formato: 5511999999999 (código do país + DDD + número)
  mensagem: string;
  tipo?: 'text' | 'template';
}

/**
 * Serviço de integração com Evolution API para WhatsApp
 * 
 * Funcionalidades principais da Evolution API:
 * - Enviar mensagens de texto
 * - Enviar mídias (imagens, documentos, áudios)
 * - Enviar mensagens com template (para números não salvos)
 * - Criar e gerenciar instâncias
 * - Webhooks para receber mensagens
 * - Status de entrega e leitura
 */
class WhatsAppService {
  private config: EvolutionAPIConfig;

  constructor() {
    this.config = {
      baseURL: process.env.EVOLUTION_API_URL || 'http://localhost:8080',
      apiKey: process.env.EVOLUTION_API_KEY || '',
      instanceName: process.env.EVOLUTION_INSTANCE_NAME || 'default',
    };
  }

  /**
   * Formata o número de telefone para o formato internacional
   * Ex: (11) 99999-9999 -> 5511999999999
   */
  private formatarNumero(telefone: string): string {
    // Remove todos os caracteres não numéricos
    let numero = telefone.replace(/\D/g, '');

    // Se não começar com código do país, adiciona 55 (Brasil)
    if (!numero.startsWith('55')) {
      numero = '55' + numero;
    }

    return numero;
  }

  /**
   * Verifica se a instância está conectada
   */
  async verificarInstancia(): Promise<boolean> {
    try {
      const response = await axios.get(
        `${this.config.baseURL}/instance/fetchInstances`,
        {
          headers: {
            'apikey': this.config.apiKey,
          },
        }
      );

      const instances = response.data as any[];
      return instances.some((inst: any) => inst.instance.instanceName === this.config.instanceName);
    } catch (error) {
      console.error('Erro ao verificar instância:', error);
      return false;
    }
  }

  /**
   * Envia uma mensagem de texto simples
   */
  async enviarMensagemTexto(params: EnviarMensagemParams): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const numeroFormatado = this.formatarNumero(params.numero);

      const response = await axios.post(
        `${this.config.baseURL}/message/sendText/${this.config.instanceName}`,
        {
          number: numeroFormatado,
          text: params.mensagem,
        },
        {
          headers: {
            'apikey': this.config.apiKey,
            'Content-Type': 'application/json',
          },
        }
      );

      const responseData = response.data as any;
      return {
        success: true,
        messageId: responseData.key?.id,
      };
    } catch (error: any) {
      console.error('Erro ao enviar mensagem WhatsApp:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Erro desconhecido',
      };
    }
  }

  /**
   * Envia uma mensagem com template (para números não salvos)
   * Útil para notificações automáticas
   */
  async enviarMensagemTemplate(
    numero: string,
    template: string,
    componentes?: Array<{ type: string; parameters: Array<{ type: string; text: string }> }>
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const numeroFormatado = this.formatarNumero(numero);

      const payload: any = {
        number: numeroFormatado,
        text: template,
      };

      if (componentes) {
        payload.components = componentes;
      }

      const response = await axios.post(
        `${this.config.baseURL}/message/sendTemplate/${this.config.instanceName}`,
        payload,
        {
          headers: {
            'apikey': this.config.apiKey,
            'Content-Type': 'application/json',
          },
        }
      );

      const responseData = response.data as any;
      return {
        success: true,
        messageId: responseData.key?.id,
      };
    } catch (error: any) {
      console.error('Erro ao enviar template WhatsApp:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Erro desconhecido',
      };
    }
  }

  /**
   * Envia uma imagem com legenda
   */
  async enviarImagem(
    numero: string,
    urlImagem: string,
    legenda?: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const numeroFormatado = this.formatarNumero(numero);

      const response = await axios.post(
        `${this.config.baseURL}/message/sendMedia/${this.config.instanceName}`,
        {
          number: numeroFormatado,
          mediatype: 'image',
          media: urlImagem,
          caption: legenda || '',
        },
        {
          headers: {
            'apikey': this.config.apiKey,
            'Content-Type': 'application/json',
          },
        }
      );

      const responseData = response.data as any;
      return {
        success: true,
        messageId: responseData.key?.id,
      };
    } catch (error: any) {
      console.error('Erro ao enviar imagem WhatsApp:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Erro desconhecido',
      };
    }
  }

  /**
   * Verifica o status de uma mensagem enviada
   */
  async verificarStatusMensagem(messageId: string): Promise<any> {
    try {
      const response = await axios.get(
        `${this.config.baseURL}/message/fetchStatus/${this.config.instanceName}?messageId=${messageId}`,
        {
          headers: {
            'apikey': this.config.apiKey,
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Erro ao verificar status da mensagem:', error);
      return null;
    }
  }
}

export const whatsappService = new WhatsAppService();

