import { z } from "zod";

export const EventTypeSchema = z.enum([
  "wedding",
  "birthday",
  "community",
]);

export const BudgetItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  amount: z.number().finite().nonnegative(),
});

export const TimelineItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  completed: z.boolean(),
});

export const VendorSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  category: z.string().min(1),
  contact: z.string().optional(),
  booked: z.boolean(),
});

export const EventPlanSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  eventType: EventTypeSchema,
  eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  location: z.string(),
  guestCount: z.number().int().positive(),
  totalBudget: z.number().finite().nonnegative(),
  contingencyPercent: z.number().min(0).max(50),
  budgetItems: z.array(BudgetItemSchema),
  timeline: z.array(TimelineItemSchema),
  vendors: z.array(VendorSchema),
  ideas: z.array(z.string()),
});

export type EventType = z.infer<typeof EventTypeSchema>;
export type BudgetItem = z.infer<typeof BudgetItemSchema>;
export type TimelineItem = z.infer<typeof TimelineItemSchema>;
export type Vendor = z.infer<typeof VendorSchema>;
export type EventPlan = z.infer<typeof EventPlanSchema>;