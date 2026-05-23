export function formatCurrency(value: number | string | null | undefined) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(Number(value ?? 0));
}

export function formatNumber(value: number | string | null | undefined) {
    return new Intl.NumberFormat('id-ID').format(Number(value ?? 0));
}

export function paymentLabel(method: string) {
    const labels: Record<string, string> = {
        cash: 'Tunai',
        debit: 'Debit',
        qris: 'QRIS',
        transfer: 'Transfer',
    };

    return labels[method] ?? method;
}

export function orderTypeLabel(type: string) {
    return type === 'takeaway' ? 'Bungkus' : 'Makan di tempat';
}

export function tableStatusLabel(status: string) {
    const labels: Record<string, string> = {
        available: 'Kosong',
        occupied: 'Terisi',
        reserved: 'Reservasi',
    };

    return labels[status] ?? status;
}
