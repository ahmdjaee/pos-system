import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/format';
import { type CartLine } from '@/types/pos';
import { Minus, Plus, Trash2 } from 'lucide-react';

interface CartItemsProps {
    cart: CartLine[];
    itemError?: string;
    onUpdateQuantity: (productId: number, quantity: number) => void;
}

export function CartItems({ cart, itemError, onUpdateQuantity }: CartItemsProps) {
    return (
        <div className="space-y-4">
            <InputError message={itemError} />

            <div className="space-y-3">
                {cart.length === 0 && <p className="text-muted-foreground rounded-md border border-dashed p-4 text-sm">Keranjang masih kosong.</p>}
                {cart.map((item) => (
                    <div key={item.product.id} className="rounded-md border p-3">
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <p className="font-medium">{item.product.name}</p>
                                <p className="text-muted-foreground text-sm">{formatCurrency(item.product.price)}</p>
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => onUpdateQuantity(item.product.id, 0)}
                                aria-label="Hapus item"
                            >
                                <Trash2 className="size-4" />
                            </Button>
                        </div>
                        <div className="mt-3 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                                    aria-label="Kurangi"
                                >
                                    <Minus className="size-4" />
                                </Button>
                                <span className="w-8 text-center font-medium">{item.quantity}</span>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                                    aria-label="Tambah"
                                >
                                    <Plus className="size-4" />
                                </Button>
                            </div>
                            <p className="font-semibold">{formatCurrency(Number(item.product.price) * item.quantity)}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
