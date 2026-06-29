// Lifecycle of a ticket — always starts as OPEN, ends as CLOSED
export enum TicketStatus {
  OPEN        = 'OPEN',        // just created, waiting for agent
  IN_PROGRESS = 'IN_PROGRESS', // agent is working on it
  RESOLVED    = 'RESOLVED',    // agent marked it as resolved
  CLOSED      = 'CLOSED',      // fully closed, no more replies
}