import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/format';
import { CheckCircle2 } from 'lucide-react';

interface MobileCartBarProps {
    disabled: boolean;
    itemCount: number;
    subtotal: number;
    onOpenCart: () => void;
}

export function MobileCartBar({ disabled, itemCount, subtotal, onOpenCart }: MobileCartBarProps) {
    return (
        <div className="fixed inset-x-3 bottom-3 z-40 lg:hidden">
            <div className="bg-card flex items-center gap-3 rounded-lg border p-3 shadow-[0_14px_34px_rgba(15,23,42,0.2)]">
                <div className="min-w-0 flex-1">
                    <p className="text-muted-foreground text-xs">Keranjang</p>
                    <p className="truncate font-semibold">{formatCurrency(subtotal)}</p>
                    <p className="text-muted-foreground text-xs">{itemCount} item</p>
                </div>
                <Button type="button" disabled={disabled} onClick={onOpenCart}>
                    <CheckCircle2 className="size-4" />
                    Proses
                </Button>
            </div>
        </div>
    );
}
