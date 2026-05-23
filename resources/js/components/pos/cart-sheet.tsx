import { CartItems } from '@/components/pos/cart-items';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { formatCurrency } from '@/lib/format';
import { type CartLine } from '@/types/pos';
import { CheckCircle2 } from 'lucide-react';

interface CartSheetProps {
    cart: CartLine[];
    itemCount: number;
    itemError?: string;
    open: boolean;
    subtotal: number;
    onCheckout: () => void;
    onOpenChange: (open: boolean) => void;
    onUpdateQuantity: (productId: number, quantity: number) => void;
}

export function CartSheet({ cart, itemCount, itemError, open, subtotal, onCheckout, onOpenChange, onUpdateQuantity }: CartSheetProps) {
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="bottom" className="grid max-h-[86svh] grid-rows-[auto_minmax(0,1fr)_auto] rounded-t-xl p-0">
                <SheetHeader className="border-b p-4 text-left">
                    <SheetTitle>Rincian Pesanan</SheetTitle>
                    <SheetDescription>{itemCount} item di keranjang.</SheetDescription>
                </SheetHeader>

                <div className="min-h-0 overflow-y-auto p-4">
                    <CartItems cart={cart} itemError={itemError} onUpdateQuantity={onUpdateQuantity} />
                </div>

                <div className="bg-card space-y-3 border-t p-4 shadow-[0_-10px_24px_rgba(15,23,42,0.08)]">
                    <div className="flex items-center justify-between gap-4">
                        <span className="text-muted-foreground text-sm">Subtotal</span>
                        <span className="text-xl font-semibold">{formatCurrency(subtotal)}</span>
                    </div>
                    <Button type="button" className="w-full" disabled={cart.length === 0} onClick={onCheckout}>
                        <CheckCircle2 className="size-4" />
                        Lanjut Pembayaran
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}
