import {
  CalendarCheck,
  ClipboardList,
  Lightbulb,
  Wallet,
  type LucideIcon,
} from "lucide-react";

interface FeatureHighlight {
  icon: LucideIcon;
  title: string;
  description: string;
  iconStyle: string;
}

interface BlueprintItem {
  icon: LucideIcon;
  title: string;
  description: string;
  /** Border and background classes for the card. */
  cardStyle: string;
  /** Text colour class for the icon. */
  iconColor: string;
}

interface PlanningStep {
  number: string;
  title: string;
  description: string;
}

export const features: FeatureHighlight[] = [
  {
    icon: Lightbulb,
    title: "Personalized ideas",
    description:
      "Discover celebration ideas tailored to your event, location, and guest count.",
    iconStyle: "bg-violet-100 text-violet-700",
  },
  {
    icon: Wallet,
    title: "Smarter budgeting",
    description:
      "Organize estimated expenses while keeping a contingency reserve in mind.",
    iconStyle: "bg-blue-100 text-blue-700",
  },
  {
    icon: CalendarCheck,
    title: "A clear timeline",
    description:
      "Turn your event date into practical planning tasks and milestones.",
    iconStyle: "bg-emerald-100 text-emerald-700",
  },
];

export const blueprintItems: BlueprintItem[] = [
  {
    icon: Lightbulb,
    title: "Celebration ideas",
    description: "Inspiration shaped around your event.",
    cardStyle: "border-violet-100 bg-violet-50/70",
    iconColor: "text-violet-700",
  },
  {
    icon: Wallet,
    title: "Expense breakdown",
    description: "Estimates and a contingency reserve.",
    cardStyle: "border-blue-100 bg-blue-50/70",
    iconColor: "text-blue-700",
  },
  {
    icon: ClipboardList,
    title: "Planning checklist",
    description: "Tasks you can track as your date approaches.",
    cardStyle: "border-emerald-100 bg-emerald-50/70",
    iconColor: "text-emerald-700",
  },
];

export const planningSteps: PlanningStep[] = [
  {
    number: "01",
    title: "Tell us about your event",
    description:
      "Choose the occasion, date, location, guest count, and budget.",
  },
  {
    number: "02",
    title: "Generate your plan",
    description:
      "AuraPlan creates ideas, expense estimates, and planning tasks.",
  },
  {
    number: "03",
    title: "Make it your own",
    description: "Review your plan and manage tasks, expenses, and vendors.",
  },
];
