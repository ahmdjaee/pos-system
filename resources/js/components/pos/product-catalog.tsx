import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/format';
import { type Category, type Product } from '@/types/pos';
import { Plus, Search } from 'lucide-react';
import { type ReactNode } from 'react';

interface ProductCatalogProps {
    categories: Array<Category & { products: Product[] }>;
    filteredProducts: Product[];
    search: string;
    selectedCategory: string;
    onAddToCart: (product: Product) => void;
    onSearchChange: (search: string) => void;
    onSelectCategory: (categoryId: string) => void;
}

export function ProductCatalog({
    categories,
    filteredProducts,
    search,
    selectedCategory,
    onAddToCart,
    onSearchChange,
    onSelectCategory,
}: ProductCatalogProps) {
    return (
        <div className="flex min-w-0 flex-col gap-4">
            <div className="flex flex-col gap-3">
                <div className="relative flex-1">
                    <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                    <Input
                        value={search}
                        onChange={(event) => onSearchChange(event.target.value)}
                        placeholder="Cari menu atau SKU"
                        className="pl-9"
                    />
                </div>
                <div className="scrollbar-hide flex gap-2 overflow-x-auto border-b pb-2">
                    <CategoryTab active={selectedCategory === 'all'} onClick={() => onSelectCategory('all')}>
                        Semua
                    </CategoryTab>
                    {categories.map((category) => (
                        <CategoryTab
                            key={category.id}
                            active={selectedCategory === String(category.id)}
                            onClick={() => onSelectCategory(String(category.id))}
                        >
                            <span className="size-2.5 rounded-full" style={{ backgroundColor: category.color }} />
                            {category.name}
                        </CategoryTab>
                    ))}
                </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {filteredProducts.map((product) => (
                    <button
                        type="button"
                        key={product.id}
                        onClick={() => onAddToCart(product)}
                        className="bg-card rounded-lg border p-4 text-left transition hover:border-teal-500 hover:bg-teal-50/40 dark:hover:bg-teal-950/20"
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <p className="font-medium">{product.name}</p>
                                <p className="text-muted-foreground mt-1 text-xs">{product.sku}</p>
                            </div>
                            <Plus className="size-4 shrink-0 text-teal-700" />
                        </div>
                        <p className="mt-4 text-lg font-semibold">{formatCurrency(product.price)}</p>
                        <div className="mt-3 flex items-center gap-2">
                            {product.track_stock ? (
                                <Badge variant="outline">Stok {product.stock}</Badge>
                            ) : (
                                <Badge variant="secondary">Tanpa stok</Badge>
                            )}
                        </div>
                    </button>
                ))}
            </div>

            {filteredProducts.length === 0 && <div className="text-muted-foreground rounded-lg border p-6 text-sm">Menu tidak ditemukan.</div>}
        </div>
    );
}

function CategoryTab({ active, children, onClick }: { active: boolean; children: ReactNode; onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex h-10 shrink-0 items-center gap-2 rounded-md px-4 text-sm font-medium transition ${
                active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
        >
            {children}
        </button>
    );
}
