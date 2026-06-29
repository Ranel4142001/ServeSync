// How urgent is this ticket?
// The AI triage will auto-assign this later in Phase 4
export enum TicketPriority {
  LOW    = 'LOW',    // not urgent, can wait
  MEDIUM = 'MEDIUM', // normal priority (default)
  HIGH   = 'HIGH',   // needs attention soon
  URGENT = 'URGENT', // drop everything, fix this now
}