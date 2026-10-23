import type { EventPlan } from "../../src/domain/schema";

export const samplePlan: EventPlan = {
  id: "plan-1",
  title: "Birthday Celebration",
  eventType: "birthday",
  eventDate: "2099-12-31",
  location: "Hyderabad",
  guestCount: 50,
  totalBudget: 100000,
  contingencyPercent: 10,
  budgetItems: [{ id: "b1", name: "Venue", amount: 40000 }],
  timeline: [
    { id: "t2", title: "Send invites", date: "2099-12-20", completed: true },
    { id: "t1", title: "Book venue", date: "2099-11-30", completed: false },
  ],
  vendors: [{ id: "v1", name: "Caterer", category: "Catering", booked: false }],
  ideas: ["Photo booth"],
};
