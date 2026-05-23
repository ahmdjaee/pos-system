import { type CartLine, type PosTotals } from '@/types/pos';

export function calculatePosTotals(cart: CartLine[], taxRate: number, discount: number, paidAmount: number): PosTotals {
    const subtotal = cart.reduce((total, item) => total + Number(item.product.price) * item.quantity, 0);
    const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
    const tax = Math.round(subtotal * taxRate);
    const total = Math.max(0, subtotal + tax - Number(discount || 0));
    const change = Math.max(0, Number(paidAmount || 0) - total);

    return {
        subtotal,
        itemCount,
        tax,
        total,
        change,
    };
}
