
export enum Marketplace {
  MERCADO_LIVRE = 'Mercado Livre',
  SHOPEE = 'Shopee',
  SHEIN = 'Shein',
  AMAZON = 'Amazon',
  TEMU = 'Temu',
  MAGALU = 'Magalu',
  AMERICANAS = 'Americanas',
  TIKTOK_SHOP = 'TikTok Shop',
  ALIEXPRESS = 'AliExpress',
  CARREFOUR = 'Carrefour',
  KABUM = 'Kabum',
  CASAS_BAHIA = 'Casas Bahia'
}

export enum SocialPlatform {
  INSTAGRAM = 'Instagram',
  FACEBOOK = 'Facebook',
  TIKTOK = 'TikTok',
  YOUTUBE = 'YouTube',
  GOOGLE = 'Google Ads'
}

export enum ProductStatus {
  DRAFT = 'Draft',
  SYNCED = 'Synced',
  OUT_OF_STOCK = 'Out of Stock',
  ERROR = 'Error'
}

export enum FulfillmentType {
  STOCK = 'Estoque Próprio',
  DROPSHIPPING = 'Dropshipping'
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  price: number;
  costPrice?: number;
  stock: number;
  marketplace: Marketplace;
  status: ProductStatus;
  fulfillment: FulfillmentType;
  supplierName?: string;
  supplierUrl?: string;
  lastUpdated: string;
  image: string;
  description?: string;
  trustScore?: number;
}

export interface AdCampaign {
  id: string;
  name: string;
  platform: SocialPlatform;
  status: 'active' | 'paused' | 'draft' | 'analyzing';
  budget: number;
  spent: number;
  roas: number;
  clicks: number;
  conversions: number;
  creatives: AdAsset[];
}

export interface AdAsset {
  id: string;
  type: 'image' | 'video';
  url: string;
  headline: string;
  body: string;
  cta: string;
}

export interface Order {
  id: string;
  customerName: string;
  productName: string;
  totalValue: number;
  costValue: number;
  marketplaceFee: number;
  profit: number;
  status: 'pending' | 'splitting' | 'paid_supplier' | 'shipped' | 'flagged_fraud' | 'quarantine';
  riskScore: number;
  cancellationRisk?: number; 
  riskReason?: string;
  timestamp: string;
  marketplace: Marketplace;
  trackingCode?: string;
  potentialLoss?: number; 
}

export interface AIResponse {
  optimizedTitle: string;
  description: string;
  bulletPoints: string[];
  keywords: string[];
  suggestedCategory: string;
  suggestedPrice: number;
  supplierInsight?: {
    bestSupplierName: string;
    bestSupplierPrice: number;
    savingsPotential: number;
    link: string;
  };
}

export interface CrmMessage {
  id: string;
  customer: string;
  platform: Marketplace | SocialPlatform | 'Web (Social Listening)';
  text: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  type: 'public_comment' | 'private_message' | 'crisis_alert' | 'confirmation_request';
  timestamp: string;
  aiDraft?: string;
  isRead: boolean;
  isCrisis?: boolean;
  sourceUrl?: string;
}

export interface LiveSessionRecord {
  id: string;
  date: string;
  startTime: string;
  duration: string;
  totalSales: number;
  peakViewers: number;
  totalLikes: number;
  bestPlatform: string;
}
