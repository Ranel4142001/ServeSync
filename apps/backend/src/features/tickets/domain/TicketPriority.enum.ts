// Priority level of a ticket; AI triage will auto-assign this
export enum TicketPriority {
  LOW = "LOW",          // not urgent, can wait
  MEDIUM = "MEDIUM",   // normal priority (default)
  HIGH = "HIGH",      // needs attention soon
  URGENT = "URGENT", // drop everything, fix this no
}
