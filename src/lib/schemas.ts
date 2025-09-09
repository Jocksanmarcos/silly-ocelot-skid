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