import Dexie, { type EntityTable } from 'dexie';

export interface Product {
  id?: number; // Auto-incremented
  name: string;
  category: string;
  stock: number;
  price: number;
  status: string; // "En stock", "Stock Faible", "Rupture"
  createdAt: number;
}

export interface Movement {
  id?: number;
  productId: number;
  productName: string;
  type: "in" | "out";
  quantity: number;
  motif?: string;
  date: string; // ISO String
  timestamp: number;
  user: string;
}

export interface SaleItem {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Sale {
  id?: number;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  total: number;
  date: string;
  timestamp: number;
  user: string;
}

export interface TeamMember {
  id?: number;
  name: string;
  role: string; // "Admin", "Superviseur", "Vendeur"
  phone: string;
  location?: string;
  status: "Actif" | "Suspendu";
  createdAt: number;
}

export interface Location {
  id?: number;
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
    super('SokooDB');
    this.version(4).stores({
      products: '++id, name, category, status',
      movements: '++id, productId, type, timestamp, date',
      sales: '++id, timestamp, date',
      teamMembers: '++id, name, role, status',
      locations: '++id, name, isMain'
    });
  }
}

export const db = new SokooDB();

export async function initMockData() {
  const count = await db.products.count();
  if (count === 0) {
    const productsToAdd = [
      { name: "Riz Mémé Cassé (50kg)", category: "Alimentation", stock: 120, price: 21500, status: "En stock", createdAt: Date.now() },
      { name: "Savon Macabo (Carton)", category: "Hygiène", stock: 45, price: 12000, status: "En stock", createdAt: Date.now() },
      { name: "Huile Mayor (1L)", category: "Alimentation", stock: 8, price: 1500, status: "Stock Faible", createdAt: Date.now() },
      { name: "Lait Nido (400g)", category: "Alimentation", stock: 0, price: 2500, status: "Rupture", createdAt: Date.now() },
      { name: "Cube Maggi (Carton)", category: "Alimentation", stock: 85, price: 15000, status: "En stock", createdAt: Date.now() },
      { name: "Spaghetti Broli", category: "Alimentation", stock: 200, price: 400, status: "En stock", createdAt: Date.now() },
      { name: "Eau Minérale Supermont (1.5L)", category: "Boisson", stock: 3, price: 300, status: "Stock Faible", createdAt: Date.now() }
    ];
    
    await db.products.bulkAdd(productsToAdd);
    
    // Add some mock movements based on the initial stock (or just random recent movements)
    const now = Date.now();
    const movementsToAdd: Movement[] = [
      { productId: 2, productName: "Savon Macabo (Carton)", type: "out", quantity: 5, date: new Date(now).toISOString(), timestamp: now, user: "Alain M." },
      { productId: 1, productName: "Riz Mémé Cassé (50kg)", type: "in", quantity: 20, date: new Date(now - 1000000).toISOString(), timestamp: now - 1000000, user: "Alain M." },
      { productId: 3, productName: "Huile Mayor (1L)", type: "out", quantity: 2, date: new Date(now - 86400000).toISOString(), timestamp: now - 86400000, user: "Alain M." },
      { productId: 4, productName: "Lait Nido (400g)", type: "out", quantity: 1, date: new Date(now - 90000000).toISOString(), timestamp: now - 90000000, user: "Alain M." }
    ];
    
    await db.movements.bulkAdd(movementsToAdd);
  }
  
  const teamCount = await db.teamMembers.count();
  if (teamCount === 0) {
    const teamToAdd: TeamMember[] = [
      { name: "Paul K.", role: "Vendeur", phone: "699 00 11 22", status: "Actif", createdAt: Date.now() },
      { name: "Alain M.", role: "Admin", phone: "655 00 00 00", status: "Actif", createdAt: Date.now() },
      { name: "Béatrice F.", role: "Superviseur", phone: "677 88 99 00", status: "Suspendu", createdAt: Date.now() }
    ];
    await db.teamMembers.bulkAdd(teamToAdd);
  }

  const locationsCount = await db.locations.count();
  if (locationsCount === 0) {
    const locationsToAdd: Location[] = [
      { name: "Boutique Principale", address: "Marché Central, Douala", isMain: true, createdAt: Date.now() },
      { name: "Dépôt Akwa", address: "Akwa, Douala", isMain: false, createdAt: Date.now() }
    ];
    await db.locations.bulkAdd(locationsToAdd);
  }
}
