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

export const registrationSchema = z.object({
  full_name: z.string().min(3, { message: "O nome completo é obrigatório." }),
  email: z.string().email({ message: "Por favor, insira um email válido." }),
});

export type RegistrationFormValues = z.infer<typeof registrationSchema>;

export const cellSchema = z.object({
    name: z.string().min(3, { message: "O nome da célula é obrigatório." }),
    description: z.string().optional(),
    leader_name: z.string().min(3, { message: "O nome do líder é obrigatório." }),
    meeting_day: z.string().optional(),
    meeting_time: z.string().optional(),
    location_type: z.string().optional(),
    address: z.string().optional(),
    age_group: z.string().optional(),
    status: z.enum(["Ativa", "Inativa"]),
});

export type CellFormValues = z.infer<typeof cellSchema>;

export const cellInterestSchema = z.object({
    full_name: z.string().min(3, { message: "O nome completo é obrigatório." }),
    email: z.string().email({ message: "Por favor, insira um email válido." }),
    phone: z.string().optional(),
});

export type CellInterestFormValues = z.infer<typeof cellInterestSchema>;

export const cellReportSchema = z.object({
  meeting_date: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Data inválida." }),
  attendance_count: z.preprocess(
    (a) => parseInt(z.string().parse(a), 10),
    z.number().int().min(0, { message: "O número de presentes não pode ser negativo." })
  ),
  notes: z.string().optional(),
});

export type CellReportFormValues = z.infer<typeof cellReportSchema>;