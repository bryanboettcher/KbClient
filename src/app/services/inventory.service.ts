import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Inventory, CreateInventoryPayload, UpdateInventoryPayload } from '../models';

@Injectable({
  providedIn: 'root'
})
export class InventoryService extends ApiService {
  private endpoint = 'inventory';

  getInventory(): Observable<Inventory[]> {
    return this.get<Inventory[]>(this.endpoint);
  }

  getInventoryItem(id: string): Observable<Inventory> {
    return this.get<Inventory>(`${this.endpoint}/${id}`);
  }

  createInventory(payload: CreateInventoryPayload): Observable<Inventory> {
    return this.post<Inventory>(this.endpoint, payload);
  }

  updateInventory(id: string, payload: UpdateInventoryPayload): Observable<Inventory> {
    return this.put<Inventory>(`${this.endpoint}/${id}`, payload);
  }

  deleteInventory(id: string): Observable<void> {
    return this.delete<void>(`${this.endpoint}/${id}`);
  }

  increaseQuantity(id: string, quantity: number): Observable<Inventory> {
    return this.post<Inventory>(`${this.endpoint}/${id}/increase`, { quantity });
  }

  decreaseQuantity(id: string, quantity: number): Observable<Inventory> {
    return this.post<Inventory>(`${this.endpoint}/${id}/decrease`, { quantity });
  }

  holdInventory(id: string, quantity: number): Observable<Inventory> {
    return this.post<Inventory>(`${this.endpoint}/${id}/hold`, { quantity });
  }
}
