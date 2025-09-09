import { z } from "zod";

export const memberSchema = z.object({
  first_name: z.string().min(2, { message: "O nome deve ter pelo menos 2 caracteres." }),
  last_name: z.string().min(2, { message: "O sobrenome deve ter pelo menos 2 caracteres." }),
  email: z.string().email({ message: "Por favor, insira um email válido." }).optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  membership_date: z.string().optional(),
});

export type MemberFormValues = z.infer<typeof memberSchema>;

export const eventSchema = z.object({
  title: z.string().min(3, { message: "O título deve ter pelo menos 3 caracteres." }),
  description: z.string().optional(),
  event_date: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Data inválida." }),
  location: z.string().optional(),
  price: z.preprocess(
    (a) => parseFloat(z.string().parse(a)),
    z.number().min(0, { message: "O preço não pode ser negativo." })
  ).optional(),
  capacity: z.preprocess(
    (a) => parseInt(z.string().parse(a), 10),
    z.number().int().min(0, { message: "A capacidade não pode ser negativa." })
  ).optional(),
  type: z.enum(["interno", "externo"]),
});

export type EventFormValues = z.infer<typeof eventSchema>;