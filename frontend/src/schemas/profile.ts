import { z } from 'zod';

export const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  middleName: z.string().optional(),
  lastName: z.string().min(1, 'Last name is required'),
  phoneNumber: z
    .string()
    .regex(/^[\d\s\-+()]*$/, 'Invalid phone number')
    .optional()
    .or(z.literal('')),
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
});

export type CompleteProfileFormData = z.infer<typeof profileSchema>;
