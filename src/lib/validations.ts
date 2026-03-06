import { z } from "zod";

// TAG SCHEMAS

export const TagSchema = z.object({
  name: z
    .string()
    .min(1, "Tag name is required")
    .max(30, "Tag name must be under 30 characters")
    .trim(),
});

// ENTRY SCHEMAS

export const CreateEntrySchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be under 100 characters")
    .trim(),
  date: z
    .string()
    .min(1, "Date is required"),
  body: z
    .string()
    .min(1, "Body is required"),
  tags: z
    .array(z.string().min(1))
    .default([]),
  projectIds: z
    .array(z.string())
    .default([]),
});

export const UpdateEntrySchema = CreateEntrySchema.partial().extend({
  id: z.string().min(1, "Entry ID is required"),
});

// PROJECT SCHEMAS

export const CreateProjectSchema = z.object({
  name: z
    .string()
    .min(1, "Project name is required")
    .max(100, "Name must be under 100 characters")
    .trim(),
  description: z
    .string()
    .min(1, "Description is required")
    .trim(),
  status: z.enum(["Idea", "Building", "Shipped", "Paused"], {
    message: "Invalid status value",
  }),
  liveUrl: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  repoUrl: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  tags: z
    .array(z.string().min(1))
    .default([]),
});

export const UpdateProjectSchema = CreateProjectSchema.partial().extend({
  id: z.string().min(1, "Project ID is required"),
});

// RESOURCE SCHEMAS

export const CreateResourceSchema = z.object({
  url: z
    .string()
    .url("Must be a valid URL"),
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be under 100 characters")
    .trim(),
  category: z.enum(["Article", "Video", "Docs", "Course", "Other"], {
    message: "Invalid category value",
  }),
  notes: z
    .string()
    .optional(),
  tags: z
    .array(z.string().min(1))
    .default([]),
  entryId: z
    .string()
    .optional(),
  projectId: z
    .string()
    .optional(),
});

export const UpdateResourceSchema = CreateResourceSchema.partial().extend({
  id: z.string().min(1, "Resource ID is required"),
});

export const ToggleResourceSchema = z.object({
  isRead: z.boolean().optional(),
  isFavourite: z.boolean().optional(),
});



// INFERRED TYPES

export type TagInput = z.infer<typeof TagSchema>;

export type CreateEntryInput = z.infer<typeof CreateEntrySchema>;
export type UpdateEntryInput = z.infer<typeof UpdateEntrySchema>;

export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;
export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>;

export type CreateResourceInput = z.infer<typeof CreateResourceSchema>;
export type UpdateResourceInput = z.infer<typeof UpdateResourceSchema>;
export type ToggleResourceInput = z.infer<typeof ToggleResourceSchema>;