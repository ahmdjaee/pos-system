import { Alert, AlertDescription } from '@/components/ui/alert';
import { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';

export function FlashMessage() {
    const { flash } = usePage<SharedData>().props;

    if (!flash?.success && !flash?.error) {
        return null;
    }

    return (
        <Alert className={flash.error ? 'border-red-200 bg-red-50 text-red-900 dark:border-red-950 dark:bg-red-950/30 dark:text-red-200' : ''}>
            <AlertDescription>{flash.success ?? flash.error}</AlertDescription>
        </Alert>
    );
}
