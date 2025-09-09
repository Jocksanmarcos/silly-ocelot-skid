import { z } from "zod";

export const memberSchema = z.object({
  first_name: z.string().min(2, { message: "O nome deve ter pelo menos 2 caracteres." }),
  last_name: z.string().min(2, { message: "O sobrenome deve ter pelo menos 2 caracteres." }),
  email: z.string().email({ message: "Por favor, insira um email válido." }).optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  membership_date: z.string().optional(),
  date_of_birth: z.string().optional(),
  family_id: z.string().optional(),
  marital_status: z.string().optional(),
  family_role: z.string().optional(),
});

export type MemberFormValues = z.infer<typeof memberSchema>;

export const familySchema = z.object({
    name: z.string().min(3, { message: "O nome da família deve ter pelo menos 3 caracteres." }),
    head_of_family_id: z.string().optional(),
});

export type FamilyFormValues = z.infer<typeof familySchema>;

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
    leader_id: z.string().optional(),
    supervisor_id: z.string().optional(),
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

export const contributionSchema = z.object({
  contributor_type: z.enum(["member", "anonymous"]),
  member_id: z.string().optional(),
  contributor_name: z.string().optional(),
  amount: z.preprocess(
    (a) => parseFloat(z.string().parse(a)),
    z.number().positive({ message: "O valor deve ser maior que zero." })
  ),
  contribution_date: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Data inválida." }),
  fund: z.string().min(1, { message: "Selecione um fundo." }),
  payment_method: z.string().min(1, { message: "Selecione um método de pagamento." }),
  notes: z.string().optional(),
}).refine(data => {
    if (data.contributor_type === 'member') return !!data.member_id;
    if (data.contributor_type === 'anonymous') return !!data.contributor_name && data.contributor_name.length >= 2;
    return false;
}, {
    message: "Selecione um membro ou informe o nome do contribuinte.",
    path: ["member_id"], // or contributor_name, depending on the logic
});

export type ContributionFormValues = z.infer<typeof contributionSchema>;

// Schema para o Módulo de Ensino
export const courseSchema = z.object({
  title: z.string().min(3, { message: "O título do curso é obrigatório." }),
  description: z.string().optional(),
  thumbnail_url: z.string().url({ message: "Por favor, insira uma URL de imagem válida." }).optional().or(z.literal('')),
});

export type CourseFormValues = z.infer<typeof courseSchema>;