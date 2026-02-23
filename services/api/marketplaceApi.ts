
import { Marketplace, Product } from "../../types";

export const marketplaceApi = {
  async getAuthUrl(platform: Marketplace): Promise<string> {
    const urls = {
      [Marketplace.MERCADO_LIVRE]: "https://auth.mercadolivre.com.br/authorization",
      [Marketplace.AMAZON]: "https://sellercentral.amazon.com/apps/authorize",
      [Marketplace.SHOPEE]: "https://partner.shopeemobile.com/api/v1/oauth/authorize",
      [Marketplace.SHEIN]: "https://open.shein.com/cgi-bin/oauth2/authorize",
      [Marketplace.TEMU]: "https://open-api.temu.com/oauth/authorize",
      [Marketplace.MAGALU]: "https://integra.magalu.com/oauth/authorize",
      [Marketplace.AMERICANAS]: "https://api.americanas.com.br/oauth",
      [Marketplace.TIKTOK_SHOP]: "https://auth.tiktok-shops.com/oauth/authorize",
      [Marketplace.ALIEXPRESS]: "https://oauth.aliexpress.com/authorize",
      [Marketplace.CARREFOUR]: "https://marketplace-api.carrefour.com.br/oauth",
      [Marketplace.KABUM]: "https://api.kabum.com.br/oauth",
      [Marketplace.CASAS_BAHIA]: "https://api.viavarejo.com.br/oauth"
    };
    return `${urls[platform]}?client_id=${process.env.CLIENT_ID || 'markethub_prod'}&response_type=code`;
  },

  async calculateMLFees(price: number, shippingType: 'me2' | 'flex' | 'full', listingType: 'classic' | 'premium') {
    const feePercent = listingType === 'premium' ? 0.165 : 0.115;
    const fixedFee = price < 79 ? 6.00 : 0;
    let shippingCost = 0;
    if (price >= 79) {
      shippingCost = 22.50; 
    }
    const mktFee = (price * feePercent) + fixedFee;
    
    return {
      marketplaceFee: mktFee,
      shippingCost: shippingCost,
      netValue: price - mktFee - shippingCost,
      recommendation: price >= 79 
        ? "Produto com frete grátis obrigatório." 
        : "Taxa fixa aplicada."
    };
  },

  async predictMLCategory(productName: string): Promise<string[]> {
    return ["MLB1234 (Calçados)", "MLB5678 (Tênis Esportivos)"];
  },

  async syncStock(sku: string, platform: Marketplace, newStock: number): Promise<boolean> {
    console.log(`[Marketplace API] Sincronizando ${sku} em ${platform} para ${newStock} unidades.`);
    return true;
  },

  async publishListing(product: Product): Promise<{ success: boolean; url?: string }> {
    if (!product.sku) return { success: false };
    return { 
      success: true, 
      url: `https://markethub.ai/listing/MLB-${Math.floor(Math.random()*1000000)}` 
    };
  }
};
