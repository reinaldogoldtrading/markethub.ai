
export enum Marketplace {
  MERCADO_LIVRE = 'Mercado Livre',
  SHOPEE = 'Shopee',
  SHEIN = 'Shein',
  TEMU = 'Temu'
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
  stock: number;
  marketplace: Marketplace;
  status: ProductStatus;
  fulfillment: FulfillmentType;
  supplierName?: string;
  supplierUrl?: string;
  lastUpdated: string;
  image: string;
  description?: string;
}

export interface AIResponse {
  optimizedTitle: string;
  description: string;
  bulletPoints: string[];
  keywords: string[];
  suggestedCategory: string;
  suggestedPrice: number;
}

export interface CrmMessage {
  id: string;
  customer: string;
  platform: Marketplace | SocialPlatform | 'Web (Social Listening)';
  text: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  type: 'public_comment' | 'private_message' | 'crisis_alert';
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
