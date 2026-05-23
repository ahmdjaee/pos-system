import { FlashMessage } from '@/components/flash-message';
import { CartPanel } from '@/components/pos/cart-panel';
import { CartSheet } from '@/components/pos/cart-sheet';
import { CheckoutSheet } from '@/components/pos/checkout-sheet';
import { ConfirmCheckoutDialog } from '@/components/pos/confirm-checkout-dialog';
import { MobileCartBar } from '@/components/pos/mobile-cart-bar';
import { ProductCatalog } from '@/components/pos/product-catalog';
import AppLayout from '@/layouts/app-layout';
import { calculatePosTotals } from '@/lib/pos-calculations';
import { clearPosDraft, readPosDraft, savePosDraft } from '@/lib/pos-draft';
import { validatePosCheckout } from '@/lib/pos-validation';
import { type BreadcrumbItem } from '@/types';
import {
    type CartLine,
    type PagePropsWithErrors,
    type PosCheckoutForm,
    type PosPageProps,
    type PosValidationErrors,
    type Product,
} from '@/types/pos';
import { router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Kasir', href: '/pos' }];
const initialCheckoutForm: PosCheckoutForm = {
    customerName: '',
    orderType: 'dine_in',
    tableId: '',
    discount: 0,
    paymentMethod: 'cash',
    paidAmount: 0,
    notes: '',
};

export default function PosIndex({ categories, tables, taxRate }: PosPageProps) {
    const { errors } = usePage<PagePropsWithErrors>().props;
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [search, setSearch] = useState('');
    const [cart, setCart] = useState<CartLine[]>(() => readPosDraft()?.cart ?? []);
    const [checkoutForm, setCheckoutForm] = useState<PosCheckoutForm>(initialCheckoutForm);
    const [cartOpen, setCartOpen] = useState(false);
    const [checkoutOpen, setCheckoutOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [localErrors, setLocalErrors] = useState<PosValidationErrors>({});

    const products = useMemo(() => categories.flatMap((category) => category.products), [categories]);
    const filteredProducts = products.filter((product) => {
        const matchCategory = selectedCategory === 'all' || String(product.category_id) === selectedCategory;
        const matchSearch = `${product.name} ${product.sku}`.toLowerCase().includes(search.toLowerCase());

        return matchCategory && matchSearch;
    });
    const selectedTable = tables.find((table) => String(table.id) === checkoutForm.tableId);
    const totals = calculatePosTotals(cart, taxRate, checkoutForm.discount, checkoutForm.paidAmount);

    useEffect(() => {
        savePosDraft({ cart });
    }, [cart]);

    const clearLocalErrors = (fields: Array<keyof PosValidationErrors>) => {
        setLocalErrors((current) => {
            const nextErrors = { ...current };

            fields.forEach((field) => {
                nextErrors[field] = undefined;
            });

            return nextErrors;
        });
    };

    const updateCheckoutForm = (changes: Partial<PosCheckoutForm>, clearedErrors: Array<keyof PosValidationErrors> = []) => {
        setCheckoutForm((current) => ({ ...current, ...changes }));

        if (clearedErrors.length > 0) {
            clearLocalErrors(clearedErrors);
        }
    };

    const addToCart = (product: Product) => {
        clearLocalErrors(['items', 'paid_amount']);

        setCart((current) => {
            const existing = current.find((item) => item.product.id === product.id);

            if (existing) {
                return current.map((item) => (item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
            }

            return [...current, { product, quantity: 1, notes: '' }];
        });
    };

    const updateQuantity = (productId: number, quantity: number) => {
        clearLocalErrors(['items', 'paid_amount']);

        if (quantity < 1) {
            setCart((current) => current.filter((item) => item.product.id !== productId));
            return;
        }

        setCart((current) => current.map((item) => (item.product.id === productId ? { ...item, quantity } : item)));
    };

    const openCheckout = () => {
        if (cart.length === 0) {
            return;
        }

        savePosDraft({ cart });
        setCartOpen(false);
        setCheckoutOpen(true);
    };

    const requestConfirm = () => {
        if (processing) {
            return;
        }

        const validationErrors = validatePosCheckout({ cart, form: checkoutForm, total: totals.total });
        setLocalErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) {
            setConfirmOpen(false);
            setCheckoutOpen(true);
            return;
        }

        setConfirmOpen(true);
    };

    const checkout = () => {
        setProcessing(true);
        setConfirmOpen(false);

        router.post(
            '/pos/checkout',
            {
                items: cart.map((item) => ({
                    product_id: item.product.id,
                    quantity: item.quantity,
                    notes: item.notes,
                })),
                customer_name: checkoutForm.customerName,
                order_type: checkoutForm.orderType,
                dining_table_id: checkoutForm.tableId || null,
                discount: checkoutForm.discount,
                payment_method: checkoutForm.paymentMethod,
                paid_amount: checkoutForm.paidAmount,
                notes: checkoutForm.notes,
            },
            {
                onSuccess: () => clearPosDraft(),
                onFinish: () => setProcessing(false),
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            {/* <Head title="Kasir" />
            <PageHeader title="Kasir" description="Pilih menu, hitung pembayaran, dan simpan transaksi restoran." /> */}

            <div className="grid flex-1 gap-6 p-4 pb-28 lg:grid-cols-[1fr_420px] lg:p-6">
                <div className="flex min-w-0 flex-col gap-4">
                    <FlashMessage />
                    <ProductCatalog
                        categories={categories}
                        filteredProducts={filteredProducts}
                        search={search}
                        selectedCategory={selectedCategory}
                        onAddToCart={addToCart}
                        onSearchChange={setSearch}
                        onSelectCategory={setSelectedCategory}
                    />
                </div>

                <CartPanel
                    cart={cart}
                    itemCount={totals.itemCount}
                    itemError={errors.items}
                    subtotal={totals.subtotal}
                    onCheckout={openCheckout}
                    onUpdateQuantity={updateQuantity}
                />

                <MobileCartBar
                    disabled={cart.length === 0}
                    itemCount={totals.itemCount}
                    subtotal={totals.subtotal}
                    onOpenCart={() => setCartOpen(true)}
                />

                <CartSheet
                    cart={cart}
                    itemCount={totals.itemCount}
                    itemError={errors.items}
                    open={cartOpen}
                    subtotal={totals.subtotal}
                    onCheckout={openCheckout}
                    onOpenChange={setCartOpen}
                    onUpdateQuantity={updateQuantity}
                />

                <CheckoutSheet
                    errors={errors}
                    form={checkoutForm}
                    localErrors={localErrors}
                    open={checkoutOpen}
                    processing={processing}
                    tables={tables}
                    totals={totals}
                    onFormChange={updateCheckoutForm}
                    onOpenChange={setCheckoutOpen}
                    onRequestConfirm={requestConfirm}
                />

                <ConfirmCheckoutDialog
                    form={checkoutForm}
                    open={confirmOpen}
                    processing={processing}
                    selectedTable={selectedTable}
                    totals={totals}
                    onCheckout={checkout}
                    onOpenChange={setConfirmOpen}
                />
            </div>
        </AppLayout>
    );
}
