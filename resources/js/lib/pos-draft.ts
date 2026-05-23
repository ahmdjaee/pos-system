import { type CartLine } from '@/types/pos';

export const POS_DRAFT_STORAGE_KEY = 'pos:current-order';

export interface PosDraft {
    cart: CartLine[];
}

export function readPosDraft(): PosDraft | null {
    if (typeof window === 'undefined') {
        return null;
    }

    const rawDraft = window.sessionStorage.getItem(POS_DRAFT_STORAGE_KEY);

    if (!rawDraft) {
        return null;
    }

    try {
        const draft = JSON.parse(rawDraft) as PosDraft;

        if (!Array.isArray(draft.cart)) {
            return null;
        }

        return draft;
    } catch {
        return null;
    }
}

export function savePosDraft(draft: PosDraft) {
    if (typeof window === 'undefined') {
        return;
    }

    window.sessionStorage.setItem(POS_DRAFT_STORAGE_KEY, JSON.stringify(draft));
}

export function clearPosDraft() {
    if (typeof window === 'undefined') {
        return;
    }

    window.sessionStorage.removeItem(POS_DRAFT_STORAGE_KEY);
}
