import { SocialPlatform, AdCampaign } from "../../types";

const CAMPAIGNS_KEY = 'markethub_campaigns_db';
const BALANCE_KEY = 'superads_balance';

const getStoredBalance = () => parseFloat(localStorage.getItem(BALANCE_KEY) || '5000.00');
const setStoredBalance = (val: number) => localStorage.setItem(BALANCE_KEY, val.toFixed(2));

const getStoredCampaigns = (): AdCampaign[] => {
  const data = localStorage.getItem(CAMPAIGNS_KEY);
  if (!data) {
    // Dados iniciais de exemplo
    return [
      {
        id: 'c-init-1',
        name: 'Campanha Experimental - Tênis',
        platform: SocialPlatform.INSTAGRAM,
        status: 'active',
        budget: 1000,
        spent: 450.20,
        roas: 4.2,
        clicks: 8500,
        conversions: 120,
        creatives: []
      }
    ];
  }
  return JSON.parse(data);
};

const saveCampaigns = (campaigns: AdCampaign[]) => {
  localStorage.setItem(CAMPAIGNS_KEY, JSON.stringify(campaigns));
};

export const superAdsApi = {
  async getWalletBalance(): Promise<{ balance: number; currency: string; reserved: number }> {
    const campaigns = getStoredCampaigns();
    const reserved = campaigns.reduce((acc, c) => acc + (c.status === 'active' ? c.budget : 0), 0);
    return {
      balance: getStoredBalance(),
      currency: 'BRL',
      reserved
    };
  },

  async topUpWallet(amount: number, method: 'pix' | 'credit_advance'): Promise<boolean> {
    const current = getStoredBalance();
    setStoredBalance(current + amount);
    return true;
  },

  async deployCampaign(campaignData: any): Promise<{ success: boolean; campaignId: string }> {
    const balance = getStoredBalance();
    const required = campaignData.budget || 0;

    if (balance < required) {
      throw new Error("Saldo insuficiente na Carteira SuperAds.");
    }

    // Deduz saldo
    setStoredBalance(balance - required);

    // Cria nova campanha real no "DB"
    const newCampaign: AdCampaign = {
      id: `CAM-${Math.random().toString(36).toUpperCase().substr(2, 9)}`,
      name: campaignData.name || `IA Campaign - ${new Date().toLocaleDateString()}`,
      platform: campaignData.platform || SocialPlatform.INSTAGRAM,
      status: 'active',
      budget: required,
      spent: 0,
      roas: 0,
      clicks: 0,
      conversions: 0,
      creatives: []
    };

    const currentCampaigns = getStoredCampaigns();
    saveCampaigns([newCampaign, ...currentCampaigns]);

    return {
      success: true,
      campaignId: newCampaign.id
    };
  },

  async getPerformanceData(): Promise<AdCampaign[]> {
    return getStoredCampaigns();
  }
};
