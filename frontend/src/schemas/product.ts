import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().optional(),
  price: z.number().positive('Price must be greater than 0'),
  stockQuantity: z.number().int('Must be a whole number').min(0, 'Cannot be negative'),
  categoryId: z.number().int().positive('Please select a category'),
  imageUrl: z.url('Must be a valid URL').optional().or(z.literal('')),
});

export type ProductFormData = z.infer<typeof productSchema>;
