import { cn } from '@/lib/utils';
import { type CSSProperties, type ReactNode } from 'react';

interface ResponsiveDataListColumn {
    label: string;
    className?: string;
}

interface ResponsiveDataListProps {
    columns: ResponsiveDataListColumn[];
    desktopColumns: string;
    children: ReactNode;
    emptyMessage?: ReactNode;
    isEmpty?: boolean;
    className?: string;
}

type ResponsiveDataListStyle = CSSProperties & {
    '--responsive-data-list-columns': string;
};

export function ResponsiveDataList({ columns, desktopColumns, children, emptyMessage, isEmpty = false, className }: ResponsiveDataListProps) {
    return (
        <div
            className={cn('grid gap-3 md:block md:overflow-hidden md:rounded-lg md:border', className)}
            style={{ '--responsive-data-list-columns': desktopColumns } as ResponsiveDataListStyle}
        >
            <div className="bg-muted hidden text-sm md:grid md:[grid-template-columns:var(--responsive-data-list-columns)] md:items-center">
                {columns.map((column) => (
                    <div key={column.label} className={cn('px-4 py-3 font-medium', column.className)}>
                        {column.label}
                    </div>
                ))}
            </div>

            {children}

            {isEmpty && <div className="text-muted-foreground rounded-lg border p-6 text-sm md:rounded-none md:border-0">{emptyMessage}</div>}
        </div>
    );
}

export function ResponsiveDataListRow({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <div
            className={cn(
                'bg-card grid gap-4 rounded-lg border p-4 text-sm md:[grid-template-columns:var(--responsive-data-list-columns)] md:items-center md:gap-0 md:rounded-none md:border-0 md:border-t md:p-0',
                className,
            )}
        >
            {children}
        </div>
    );
}

export function ResponsiveDataListCell({
    label,
    children,
    className,
    valueClassName,
}: {
    label: string;
    children: ReactNode;
    className?: string;
    valueClassName?: string;
}) {
    return (
        <div className={cn('flex items-center justify-between gap-4 md:block md:px-4 md:py-3', className)}>
            <span className="text-muted-foreground md:hidden">{label}</span>
            <span className={cn('min-w-0 text-right font-medium break-words md:text-left', valueClassName)}>{children}</span>
        </div>
    );
}

export function ResponsiveDataListActions({ children, className }: { children: ReactNode; className?: string }) {
    return <div className={cn('flex justify-end gap-1 border-t pt-3 md:border-0 md:px-4 md:py-3 md:pt-3', className)}>{children}</div>;
}
