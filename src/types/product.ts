export type ProductVariation = {
  id: string;
  name: string;
  price: number;
  selected?: boolean;
};

export type ProductOption = {
  id: string;
  title: string;
  required: boolean;
  maxOptions?: number; // legacy - prefer `maxSelections`
  allowMultiple?: boolean;
  minSelections?: number;
  maxSelections?: number;
  variations: ProductVariation[];
};

export type CartItem = {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  selectedOptions: Record<string, string[]>;
  selectedOptionsPrice?: number;
  totalPrice: number;
};

export type UserRole = 'customer' | 'admin';

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  address?: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  phone?: string;
};

export type StoreInfo = {
  name: string;
  description?: string;
  logo: string;
  banner: string;
  deliveryFee: number;
  minOrder: number;
  cuisineType: string;
  address?: string | null; // Add address field (optional)
  lat?: number | null;     // Add latitude (optional)
  lng?: number | null;     // Add longitude (optional)
  enableDelivery?: boolean;
  enablePickup?: boolean;
  currency?: 'EUR';
  // Stripe configuration
  stripePublishableKey?: string | null;
  stripeSecretKey?: string | null;
  stripeWebhookSecret?: string | null;
  stripeMode?: 'test' | 'live' | string | null;
  // PayPal configuration
  paypalClientId?: string | null;
  paypalSecret?: string | null;
  paypalMode?: 'sandbox' | 'live' | string | null;
  // Theme
  primaryColor?: string | null;
  // Tenant
  tenantId?: string | null;
};

export type OrderStatus = 'pending' | 'processing' | 'delivering' | 'delivered' | 'cancelled';

export type OrderItem = {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  selectedOptions: Record<string, string[]>;
  totalPrice: number;
};

export type Order = {
  id: string;
  userId: string;
  items: OrderItem[];
  status: OrderStatus;
  total: number;
  deliveryFee: number;
  address: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  createdAt: string;
  updatedAt: string;
};

export type FoodItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  description?: string;
  popular?: boolean;
  vegetarian?: boolean;
  hasOptions?: boolean;
  category?: string;
};

// Supabase database types
export type ProductOptionDB = {
  id: string;
  product_id: string;
  title: string;
  required: boolean;
  allow_multiple?: boolean | null;
  min_selections?: number | null;
  max_selections?: number | null;
  position?: number;
  created_at?: string;
  updated_at?: string;
  option_variations?: OptionVariationDB[];
};

export type OptionVariationDB = {
  id: string;
  option_id: string;
  name: string;
  price: number;
  position?: number;
  created_at?: string;
  updated_at?: string;
};

// Variation Groups (reusable across products)
export type VariationGroupItem = {
  id: string;
  title: string;
  price: number;
  sku?: string;
  position?: number;
};

export type VariationGroup = {
  id: string;
  title: string;
  description?: string;
  position?: number;
  items: VariationGroupItem[];
  created_at?: string;
  updated_at?: string;
};

export type VariationGroupDB = {
  id: string;
  title: string;
  description?: string | null;
  position: number;
  created_at?: string;
  updated_at?: string;
};

export type VariationGroupItemDB = {
  id: string;
  group_id: string;
  title: string;
  price: number;
  sku?: string | null;
  position: number;
  created_at?: string;
  updated_at?: string;
};

export type ProductVariationGroupDB = {
  product_id: string;
  variation_group_id: string;
  position: number;
};

// Supabase Orders Database Type
export type OrderDB = {
  id: string;
  user_id: string;
  items: OrderItem[] | string; // Can be string when first received from database
  status: string; // Changed from OrderStatus to accept any string from the database
  total: number;
  delivery_fee: number;
  address: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  } | string; // Can be string when first received from database
  created_at: string;
  updated_at: string;
  profiles?: {
    name: string;
    phone: string;
    email: string;
  } | null | any; // Made more flexible to handle error states or unexpected formats
};
