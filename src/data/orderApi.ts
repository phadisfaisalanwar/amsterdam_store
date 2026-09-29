import { apiRequest } from './api';

interface CreateOrderInput {
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    province: string;
    zip: string;
  };
  items: { productId: number; quantity: number; color: string }[];
  shippingMethod: string;
  paymentMethod: string;
  paymentProof: string | null;
  couponCode: string;
}

export interface CreatedOrder {
  orderId: number;
  orderNumber: string;
  total: number;
}

export function createOrder(input: CreateOrderInput): Promise<CreatedOrder> {
  return apiRequest<CreatedOrder>('orders.php', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}