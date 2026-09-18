import { z } from 'zod';

export const userCreateSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8),
});

export const userLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const expenseCreateSchema = z.object({
  title: z.string().min(1).max(200),
  amount: z.number().positive(),
  category: z.string().min(1),
  description: z.string().max(500).optional().nullable(),
  date: z.coerce.date().optional(),
});

export const expenseUpdateSchema = z
  .object({
    title: z.string().min(1).max(200).optional(),
    amount: z.number().positive().optional(),
    category: z.string().min(1).optional(),
    description: z.string().max(500).optional().nullable(),
    date: z.coerce.date().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

export const incomeCreateSchema = z.object({
  title: z.string().min(1).max(200),
  amount: z.number().positive(),
  date: z.coerce.date().optional(),
});

export const incomeUpdateSchema = z
  .object({
    title: z.string().min(1).max(200).optional(),
    amount: z.number().positive().optional(),
    date: z.coerce.date().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });
