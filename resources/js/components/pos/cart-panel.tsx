import { CartItems } from '@/components/pos/cart-items';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/format';
import { type CartLine } from '@/types/pos';
import { CheckCircle2, ReceiptText } from 'lucide-react';

interface CartPanelProps {
    cart: CartLine[];
    itemCount: number;
    itemError?: string;
    subtotal: number;
    onCheckout: () => void;
    onUpdateQuantity: (productId: number, quantity: number) => void;
}

export function CartPanel({ cart, itemCount, itemError, subtotal, onCheckout, onUpdateQuantity }: CartPanelProps) {
    return (
        <aside className="bg-card hidden max-h-[calc(100svh-5rem)] flex-col overflow-hidden rounded-lg border lg:sticky lg:top-20 lg:flex">
            <div className="flex shrink-0 items-center gap-2 border-b p-4">
                <ReceiptText className="size-5" />
                <h2 className="font-semibold">Rincian Pesanan</h2>
                <Badge variant="secondary" className="ml-auto">
                    {itemCount} item
                </Badge>
            </div>

            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
                <CartItems cart={cart} itemError={itemError} onUpdateQuantity={onUpdateQuantity} />
            </div>

            <div className="bg-card shrink-0 space-y-3 border-t p-4 shadow-[0_-10px_24px_rgba(15,23,42,0.08)]">
                <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground text-sm">Subtotal</span>
                    <span className="text-xl font-semibold">{formatCurrency(subtotal)}</span>
                </div>
                <Button type="button" className="w-full" disabled={cart.length === 0} onClick={onCheckout}>
                    <CheckCircle2 className="size-4" />
                    Proses
                </Button>
            </div>
        </aside>
    );
}
