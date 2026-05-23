import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatCurrency, orderTypeLabel, paymentLabel } from '@/lib/format';
import { type DiningTable, type PosCheckoutForm, type PosTotals } from '@/types/pos';
import { CheckCircle2 } from 'lucide-react';

interface ConfirmCheckoutDialogProps {
    form: PosCheckoutForm;
    open: boolean;
    processing: boolean;
    selectedTable?: DiningTable;
    totals: PosTotals;
    onCheckout: () => void;
    onOpenChange: (open: boolean) => void;
}

export function ConfirmCheckoutDialog({ form, open, processing, selectedTable, totals, onCheckout, onOpenChange }: ConfirmCheckoutDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Simpan transaksi?</DialogTitle>
                    <DialogDescription>Pastikan pesanan, pembayaran, dan kembalian sudah benar sebelum transaksi disimpan.</DialogDescription>
                </DialogHeader>

                <div className="grid gap-4">
                    <div className="rounded-lg border">
                        <div className="grid gap-2 p-4 text-sm">
                            <ConfirmRow label="Item" value={`${totals.itemCount} item`} />
                            <ConfirmRow label="Tipe order" value={orderTypeLabel(form.orderType)} />
                            <ConfirmRow label="Meja" value={form.orderType === 'dine_in' ? selectedTable?.name || 'Tanpa meja' : '-'} />
                            <ConfirmRow label="Pembayaran" value={paymentLabel(form.paymentMethod)} />
                        </div>
                        <div className="bg-muted grid gap-2 border-t p-4 text-sm">
                            <ConfirmRow label="Subtotal" value={formatCurrency(totals.subtotal)} />
                            <ConfirmRow label="Pajak 10%" value={formatCurrency(totals.tax)} />
                            <ConfirmRow label="Diskon" value={formatCurrency(Number(form.discount || 0))} />
                            <ConfirmRow label="Bayar" value={formatCurrency(form.paidAmount)} />
                            <ConfirmRow label="Kembalian" value={formatCurrency(totals.change)} />
                            <div className="flex items-center justify-between border-t pt-3 font-semibold">
                                <span>Total</span>
                                <span>{formatCurrency(totals.total)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={processing}>
                            Batal
                        </Button>
                        <Button type="button" onClick={onCheckout} disabled={processing}>
                            <CheckCircle2 className="size-4" />
                            Ya, simpan
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function ConfirmRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">{label}</span>
            <span className="text-right font-medium">{value}</span>
        </div>
    );
}
