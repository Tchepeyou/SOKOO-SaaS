import Dexie, { type EntityTable } from 'dexie';

export interface Product {
  id: string; // UUID
  name: string;
  category: string;
  stock: number;
  price: number;
  purchasePrice?: number;
  barcode?: string;
  imageUrl?: string;
  status: string; // "En stock", "Stock Faible", "Rupture"
  createdAt: number;
  locationId?: string; // Ajouté pour l'isolement par point de vente
}

export interface Movement {
  id: string;
  productId: string;
  productName: string;
  type: "in" | "out";
  quantity: number;
  motif?: string;
  date: string; // ISO String
  timestamp: number;
  user: string;
  locationId?: string; // Ajouté pour l'isolement par point de vente
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Sale {
  id: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  total: number;
  date: string;
  timestamp: number;
  user: string;
  locationId?: string; // Ajouté pour l'isolement par point de vente
  paymentMethod?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string; // "Admin", "Superviseur", "Vendeur"
  phone: string;
  location?: string;
  status: "Actif" | "Suspendu";
  createdAt: number;
}

export interface Location {
  id: string;
  name: string;
  address: string;
  isMain: boolean;
  createdAt: number;
}

class SokooDB extends Dexie {
  products!: EntityTable<Product, 'id'>;
  movements!: EntityTable<Movement, 'id'>;
  sales!: EntityTable<Sale, 'id'>;
  teamMembers!: EntityTable<TeamMember, 'id'>;
  locations!: EntityTable<Location, 'id'>;

  constructor() {
    super('SokooDB_v2');
    this.version(9).stores({
      products: 'id, name, category, status, locationId, barcode',
      movements: 'id, productId, type, timestamp, date, locationId',
      sales: 'id, timestamp, date, locationId',
      teamMembers: 'id, name, role, status',
      locations: 'id, name, isMain'
    });
  }
}

export const db = new SokooDB();

export async function initMockData() {
  // Mock data initialization is disabled now that Supabase sync is live.
  // We want users to start with a completely empty local database.
}
