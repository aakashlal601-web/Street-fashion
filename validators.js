import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().trim().min(1).max(200),
  category: z.string().trim().min(1).max(60),
  price: z.number().nonnegative(),
  discountPrice: z.number().nonnegative().nullable().optional(),
  sizes: z.array(z.string().min(1)).min(1),
  colors: z.array(z.string().min(1)).min(1),
  stock: z.number().int().nonnegative(),
  description: z.string().trim().max(4000).default(''),
  imageUrl: z.string().url(),
  imagePublicId: z.string().optional().nullable(),
});

export const productUpdateSchema = productSchema.partial();

const orderItemSchema = z.object({
  productId: z.string().min(1),
  name: z.string().min(1),
  size: z.string().min(1),
  color: z.string().min(1),
  price: z.number().nonnegative(),
  qty: z.number().int().positive(),
});

export const orderCreateSchema = z.object({
  customerName: z.string().trim().min(1).max(200),
  phone: z.string().trim().min(1).max(40),
  address: z.string().trim().min(1).max(500),
  items: z.array(orderItemSchema).min(1),
});

export const orderStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
});

export const settingsSchema = z.object({
  storeName: z.string().trim().min(1).max(120),
  tagline: z.string().trim().max(200).optional().default(''),
  email: z.string().trim().email(),
  phone: z.string().trim().max(40).optional().default(''),
  currency: z.string().trim().min(1).max(4),
  shippingFee: z.number().nonnegative(),
  lowStockThreshold: z.number().int().nonnegative(),
});
