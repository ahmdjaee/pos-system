import { CurrencyInput } from '@/components/currency-input';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { formatCurrency, tableStatusLabel } from '@/lib/format';
import { type DiningTable, type PagePropsWithErrors, type PosCheckoutForm, type PosTotals, type PosValidationErrors } from '@/types/pos';
import { CheckCircle2 } from 'lucide-react';

interface CheckoutSheetProps {
    errors: PagePropsWithErrors['errors'];
    form: PosCheckoutForm;
    localErrors: PosValidationErrors;
    open: boolean;
    processing: boolean;
    tables: DiningTable[];
    totals: PosTotals;
    onFormChange: (changes: Partial<PosCheckoutForm>, clearedErrors?: Array<keyof PosValidationErrors>) => void;
    onOpenChange: (open: boolean) => void;
    onRequestConfirm: () => void;
}

export function CheckoutSheet({
    errors,
    form,
    localErrors,
    open,
    processing,
    tables,
    totals,
    onFormChange,
    onOpenChange,
    onRequestConfirm,
}: CheckoutSheetProps) {
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="bottom" className="max-h-[90svh] overflow-y-auto rounded-t-xl p-0">
                <div className="mx-auto grid w-full max-w-5xl gap-5 p-4 pt-6 sm:p-6">
                    <SheetHeader>
                        <SheetTitle>Detail Pembayaran</SheetTitle>
                        <SheetDescription>Lengkapi detail order dan pembayaran sebelum transaksi disimpan.</SheetDescription>
                    </SheetHeader>

                    <InputError message={localErrors.items || errors.items} />

                    <div className="grid items-start gap-3 md:grid-cols-2 lg:grid-cols-3">
                        <div className="grid content-start gap-2">
                            <Label htmlFor="customer_name">Nama pelanggan</Label>
                            <Input
                                id="customer_name"
                                value={form.customerName}
                                onChange={(event) => onFormChange({ customerName: event.target.value }, ['customer_name'])}
                                placeholder="Opsional"
                            />
                            <InputError message={localErrors.customer_name || errors.customer_name} />
                        </div>
                        <div className="grid content-start gap-2">
                            <Label>Tipe order</Label>
                            <Select value={form.orderType} onValueChange={(orderType) => onFormChange({ orderType })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="dine_in">Makan di tempat</SelectItem>
                                    <SelectItem value="takeaway">Bungkus</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid content-start gap-2">
                            <Label>Meja</Label>
                            <Select
                                value={form.tableId || 'none'}
                                onValueChange={(value) => onFormChange({ tableId: value === 'none' ? '' : value })}
                                disabled={form.orderType !== 'dine_in'}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih meja" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Tanpa meja</SelectItem>
                                    {tables.map((table) => (
                                        <SelectItem key={table.id} value={String(table.id)}>
                                            {table.name} · {tableStatusLabel(table.status)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid content-start gap-2">
                            <Label>Metode bayar</Label>
                            <Select value={form.paymentMethod} onValueChange={(paymentMethod) => onFormChange({ paymentMethod })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="cash">Tunai</SelectItem>
                                    <SelectItem value="debit">Debit</SelectItem>
                                    <SelectItem value="qris">QRIS</SelectItem>
                                    <SelectItem value="transfer">Transfer</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid content-start gap-2">
                            <Label htmlFor="discount">Diskon</Label>
                            <CurrencyInput
                                id="discount"
                                value={form.discount}
                                onValueChange={(discount) => onFormChange({ discount }, ['discount', 'paid_amount'])}
                            />
                            <InputError message={localErrors.discount || errors.discount} />
                        </div>
                        <div className="grid content-start gap-2">
                            <Label htmlFor="paid_amount">Nominal bayar</Label>
                            <CurrencyInput
                                id="paid_amount"
                                value={form.paidAmount}
                                onValueChange={(paidAmount) => onFormChange({ paidAmount }, ['paid_amount'])}
                            />
                            <InputError message={localErrors.paid_amount || errors.paid_amount} />
                        </div>
                        <div className="grid content-start gap-2 md:col-span-2 lg:col-span-3">
                            <Label htmlFor="notes">Catatan</Label>
                            <Input
                                id="notes"
                                value={form.notes}
                                onChange={(event) => onFormChange({ notes: event.target.value }, ['notes'])}
                                placeholder="Opsional"
                            />
                            <InputError message={localErrors.notes || errors.notes} />
                        </div>
                    </div>

                    <div className="bg-card grid gap-3 rounded-lg border p-4 shadow-sm">
                        <div className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                            <PriceRow label="Subtotal" value={totals.subtotal} />
                            <PriceRow label="Pajak 10%" value={totals.tax} />
                            <PriceRow label="Diskon" value={Number(form.discount || 0)} />
                            <PriceRow label="Kembalian" value={totals.change} />
                        </div>
                        <div className="flex flex-col gap-3 border-t pt-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-muted-foreground text-sm">Total tagihan</p>
                                <p className="text-2xl font-semibold">{formatCurrency(totals.total)}</p>
                            </div>
                            <Button
                                type="button"
                                size="lg"
                                disabled={processing || totals.itemCount === 0}
                                className="w-full sm:w-auto"
                                onClick={onRequestConfirm}
                            >
                                <CheckCircle2 className="size-4" />
                                Simpan
                            </Button>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}

function PriceRow({ label, value }: { label: string; value: number }) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{label}</span>
            <span>{formatCurrency(value)}</span>
        </div>
    );
}
