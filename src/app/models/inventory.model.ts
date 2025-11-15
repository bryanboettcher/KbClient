export interface Inventory {
  id: string;
  productId: string;
  productName?: string;
  quantity: number;
  location?: string;
  lastUpdated?: Date;
}

export interface InventoryTransaction {
  id: string;
  inventoryId: string;
  type: 'increase' | 'decrease' | 'hold' | 'release';
  quantity: number;
  reason?: string;
  timestamp: Date;
}

export interface CreateInventoryPayload {
  productId: string;
  quantity: number;
  location?: string;
}

export interface UpdateInventoryPayload {
  quantity?: number;
  location?: string;
}
