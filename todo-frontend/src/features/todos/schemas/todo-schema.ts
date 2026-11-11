import { z } from "zod";

export const todoSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(255, "Title must be 255 characters or fewer"),
  description: z
    .string()
    .max(2000, "Description must be 2000 characters or fewer")
    .optional()
    .or(z.literal("")),
});

export type TodoFormValues = z.infer<typeof todoSchema>;
