
import { Order } from "../../types";

export interface CreditPartner {
  id: string;
  name: string;
  dailyRate: number;
  rating: string;
  logo: string;
}

export const fintechApi = {
  // Retorna parceiros bancários/FIDCs que estão oferecendo crédito hoje
  async getCreditPartners(): Promise<CreditPartner[]> {
    return [
      { id: 'p2', name: 'FIDC Market-Cap', dailyRate: 0.038, rating: 'AA+', logo: '📊' },
      { id: 'p3', name: 'Safra Pay API', dailyRate: 0.042, rating: 'AAA', logo: '🏦' },
      { id: 'p1', name: 'Stone Open Banking', dailyRate: 0.045, rating: 'AAA', logo: '💎' }
    ];
  },

  async checkCreditLimit(): Promise<{ available: number; total: number }> {
    // Limite agora é provido pelo pool de parceiros externos
    return { available: 125000.00, total: 500000.00 };
  },

  // A antecipação agora é uma "Cessão de Crédito" para o parceiro
  async requestAdvance(orderId: string, amount: number, partnerId: string): Promise<{ success: boolean; transactionId: string; fee: number }> {
    console.log(`[Fintech Bridge] Cedendo recebível do pedido ${orderId} para o parceiro ${partnerId}`);
    // Simulação de delay de processamento de smart contract
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return { 
      success: true, 
      transactionId: `CESSAO-${Math.random().toString(36).toUpperCase().substr(2, 9)}`,
      fee: amount * 0.012 // Taxa de serviço do Hub (lucro puro para nós)
    };
  }
};
