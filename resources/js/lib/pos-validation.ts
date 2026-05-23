import { type CartLine, type PosCheckoutForm, type PosValidationErrors } from '@/types/pos';

interface ValidateCheckoutInput {
    cart: CartLine[];
    form: PosCheckoutForm;
    total: number;
}

export function validatePosCheckout({ cart, form, total }: ValidateCheckoutInput): PosValidationErrors {
    const validationErrors: PosValidationErrors = {};

    if (cart.length === 0) {
        validationErrors.items = 'Keranjang masih kosong.';
    }

    const invalidQuantity = cart.find((item) => item.quantity < 1 || item.quantity > 99);
    if (invalidQuantity) {
        validationErrors.items = 'Jumlah item harus antara 1 sampai 99.';
    }

    const unavailableStock = cart.find((item) => item.product.track_stock && item.quantity > item.product.stock);
    if (unavailableStock) {
        validationErrors.items = `Stok ${unavailableStock.product.name} tidak cukup.`;
    }

    if (form.customerName.length > 120) {
        validationErrors.customer_name = 'Nama pelanggan maksimal 120 karakter.';
    }

    if (Number(form.discount || 0) < 0) {
        validationErrors.discount = 'Diskon tidak boleh kurang dari 0.';
    }

    if (Number(form.paidAmount || 0) < total) {
        validationErrors.paid_amount = 'Nominal bayar kurang dari total tagihan.';
    }

    if (form.notes.length > 500) {
        validationErrors.notes = 'Catatan maksimal 500 karakter.';
    }

    return validationErrors;
}
