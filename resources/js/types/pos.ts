import { type SharedData } from '@/types';

export interface Category {
    id: number;
    name: string;
    color: string;
    products?: Product[];
    products_count?: number;
}

export interface Product {
    id: number;
    category_id: number;
    name: string;
    sku: string;
    description?: string | null;
    price: number;
    cost: number;
    stock: number;
    low_stock_threshold: number;
    track_stock: boolean;
    is_available: boolean;
    category?: Category;
}

export interface DiningTable {
    id: number;
    name: string;
    capacity: number;
    status: string;
}

export interface PagePropsWithErrors extends SharedData {
    errors: Record<string, string>;
}

export interface CartLine {
    product: Product;
    quantity: number;
    notes: string;
}

export interface PosPageProps {
    categories: Array<Category & { products: Product[] }>;
    tables: DiningTable[];
    taxRate: number;
}

export interface ProductsPageProps {
    categories: Category[];
    products: Product[];
}

export interface CategoriesPageProps {
    categories: Category[];
}

export interface TablesPageProps {
    tables: DiningTable[];
    statuses: string[];
}

export interface DashboardSummary {
    today_sales: number;
    today_orders: number;
    average_order: number;
    active_products: number;
}

export interface LowStockProduct {
    id: number;
    name: string;
    stock: number;
    low_stock_threshold: number;
    category?: {
        name: string;
        color: string;
    };
}

export interface RecentOrder {
    id: number;
    invoice_number: string;
    customer_name?: string;
    table_name?: string;
    cashier_name?: string;
    total: number;
    payment_method: string;
    paid_at?: string;
}

export interface TopProduct {
    product_name: string;
    sold: number;
    revenue: number;
}

export interface DashboardPageProps {
    summary: DashboardSummary;
    lowStockProducts: LowStockProduct[];
    recentOrders: RecentOrder[];
    topProducts: TopProduct[];
}

export interface OrderListItem {
    id: number;
    invoice_number: string;
    customer_name?: string | null;
    order_type: string;
    table_name?: string | null;
    cashier_name?: string | null;
    total: number;
    payment_method: string;
    paid_at?: string | null;
}

export interface OrdersPageProps {
    date: string;
    orders: OrderListItem[];
    summary: {
        total_sales: number;
        total_orders: number;
        total_items: number;
    };
}

export interface OrderDetailItem {
    id: number;
    product_name: string;
    unit_price: number;
    quantity: number;
    subtotal: number;
    notes?: string | null;
}

export interface OrderDetail {
    id: number;
    invoice_number: string;
    customer_name?: string | null;
    order_type: string;
    table_name?: string | null;
    cashier_name?: string | null;
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
    payment_method: string;
    paid_amount: number;
    change_amount: number;
    notes?: string | null;
    paid_at?: string | null;
    items: OrderDetailItem[];
}

export interface OrderShowPageProps {
    order: OrderDetail;
}

export interface DailySalesRow {
    date: string;
    total: number;
    orders: number;
}

export interface PaymentMethodRow {
    payment_method: string;
    total: number;
    orders: number;
}

export interface TopProductRow {
    product_name: string;
    quantity: number;
    total: number;
}

export interface ReportsPageProps {
    filters: {
        from: string;
        to: string;
    };
    summary: {
        total_sales: number;
        total_orders: number;
        average_order: number;
        total_tax: number;
    };
    dailySales: DailySalesRow[];
    paymentMethods: PaymentMethodRow[];
    topProducts: TopProductRow[];
}
