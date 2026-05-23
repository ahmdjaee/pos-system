import { Input } from '@/components/ui/input';
import { formatNumber } from '@/lib/format';
import * as React from 'react';

interface CurrencyInputProps extends Omit<React.ComponentProps<typeof Input>, 'type' | 'value' | 'onChange'> {
    value: number;
    onValueChange: (value: number) => void;
}

export const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
    ({ value, onValueChange, placeholder = 'Rp 0', ...props }, ref) => {
        const displayValue = value > 0 ? `Rp ${formatNumber(value)}` : '';

        return (
            <Input
                {...props}
                ref={ref}
                type="text"
                inputMode="numeric"
                value={displayValue}
                placeholder={placeholder}
                onChange={(event) => {
                    const numericValue = event.target.value.replace(/[^\d]/g, '');

                    onValueChange(numericValue === '' ? 0 : Number(numericValue));
                }}
            />
        );
    },
);

CurrencyInput.displayName = 'CurrencyInput';
