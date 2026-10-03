export type PaymentStatus = "paid" | "pending" | "partial";
export type PaymentMethod =
  | "cash"
  | "upi"
  | "card"
  | "bank_transfer"
  | "other";

export interface Shop {
  id: string;
  name: string;
  tagline: string | null;
  logo_url: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  upi_id: string | null;
  invoice_footer: string | null;
  invoice_prefix: string;
  invoice_next_number: number;
  show_tax: boolean;
  tax_rate: number;
  show_discount: boolean;
}

export interface Customer {
  id: string;
  shop_id: string;
  name: string;
  phone: string;
  email: string | null;
  address: string | null;
  created_at: string;
}

export interface Bike {
  id: string;
  customer_id: string;
  name: string;
  registration_number: string;
}

export interface Service {
  id: string;
  shop_id: string;
  name: string;
  description: string | null;
  default_price: number;
  estimated_minutes: number | null;
  status: string;
}

export interface InventoryItem {
  id: string;
  shop_id: string;
  name: string;
  item_type: string;
  description: string | null;
  quantity: number;
  unit: string;
  purchase_price: number;
  selling_price: number;
  low_stock_threshold: number;
  supplier: string | null;
  status: string;
}

export interface InvoiceItem {
  id?: string;
  item_name: string;
  item_type: string;
  quantity: number;
  rate: number;
  discount: number;
  amount: number;
  service_id?: string | null;
  inventory_item_id?: string | null;
}

export interface Invoice {
  id: string;
  shop_id: string;
  invoice_number: string;
  customer_id: string | null;
  bike_id: string | null;
  customer_name: string;
  customer_phone: string;
  bike_name: string | null;
  bike_registration: string | null;
  invoice_date: string;
  subtotal: number;
  discount_total: number;
  tax_amount: number;
  total_amount: number;
  payment_method: string | null;
  payment_status: PaymentStatus;
  amount_paid: number;
  balance_due: number;
  notes: string | null;
  created_at: string;
  items?: InvoiceItem[];
}

export interface Expense {
  id: string;
  shop_id: string;
  title: string;
  category: string;
  amount: number;
  expense_date: string;
  payment_method: string | null;
  description: string | null;
}

export interface Employee {
  id: string;
  shop_id: string;
  name: string;
  phone: string | null;
  role: string;
  joining_date: string | null;
  monthly_salary: number;
  status: string;
}

export interface EmployeeSalary {
  id: string;
  employee_id: string;
  shop_id: string;
  salary_month: string;
  base_salary: number;
  bonus: number;
  deduction: number;
  net_salary: number;
  payment_status: string;
}

export interface ActivityLog {
  id: string;
  message: string;
  created_at: string;
}

export interface DashboardStats {
  revenueThisMonth: number;
  revenuePrevMonth: number;
  expensesThisMonth: number;
  expensesPrevMonth: number;
  salaryThisMonth: number;
  salaryPrevMonth: number;
  invoiceCount: number;
  monthlyRevenue: { month: string; revenue: number }[];
  recentInvoices: Invoice[];
  recentActivity: ActivityLog[];
}
