import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { db } from '@divisha/database';
import { InventoryTransactionReason } from '@divisha/types';

export interface AdjustStockInput {
  variantId: string;
  quantityDelta: number; // e.g. +20 or -5
  reason: InventoryTransactionReason;
  notes?: string;
  adminId?: string;
}

@Injectable()
export class InventoryService {
  getAllInventory() {
    const list: any[] = [];
    db.products.forEach((p) => {
      p.variants.forEach((v) => {
        const inv = db.inventory.get(v.id) || { stock: v.stock, reserved: 0, lowThreshold: 5 };
        list.push({
          productId: p.id,
          productName: p.name,
          productSku: p.sku,
          variantId: v.id,
          variantTitle: v.title,
          variantSku: v.sku,
          currentStock: inv.stock,
          reservedStock: inv.reserved,
          availableStock: Math.max(0, inv.stock - inv.reserved),
          lowStockThreshold: inv.lowThreshold,
          isLowStock: inv.stock <= inv.lowThreshold,
          isOutOfStock: inv.stock <= 0
        });
      });
    });
    return list;
  }

  adjustStock(input: AdjustStockInput) {
    const inv = db.inventory.get(input.variantId);
    if (!inv) {
      throw new NotFoundException(`Inventory item for variant '${input.variantId}' not found`);
    }

    const success = db.adjustStock(
      input.variantId,
      input.quantityDelta,
      input.reason,
      input.notes,
      input.adminId || 'admin-dashboard'
    );

    if (!success) {
      throw new BadRequestException('Stock adjustment would result in negative available inventory');
    }

    return {
      success: true,
      message: 'Inventory successfully updated with mandatory audit transaction recorded',
      currentStock: db.inventory.get(input.variantId)
    };
  }

  getTransactions() {
    return db.inventoryTransactions;
  }

  getInventorySummary() {
    const list = this.getAllInventory();
    const totalSKUs = list.length;
    const totalUnitsOnHand = list.reduce((acc, i) => acc + i.currentStock, 0);
    const totalUnitsReserved = list.reduce((acc, i) => acc + i.reservedStock, 0);
    const lowStockCount = list.filter((i) => i.isLowStock && !i.isOutOfStock).length;
    const outOfStockCount = list.filter((i) => i.isOutOfStock).length;

    return {
      totalSKUs,
      totalUnitsOnHand,
      totalUnitsReserved,
      lowStockCount,
      outOfStockCount
    };
  }
}
