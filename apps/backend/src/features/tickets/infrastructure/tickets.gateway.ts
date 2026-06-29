import { Server } from 'socket.io';

// This is the real-time layer — when something happens
// to a ticket, we instantly notify connected clients
// without them needing to refresh the page

export function registerTicketGateway(io: Server): void {

  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    // A user joins a "room" for their organization
    // This means they only receive events for THEIR organization
    // e.g. an agent at "Acme Corp" won't see tickets from "Beta Corp"
    socket.on('join:organization', (organizationId: string) => {
      socket.join(organizationId);
      console.log(`Socket ${socket.id} joined org: ${organizationId}`);
    });

    // A user joins a specific ticket room
    // Used to get real-time message updates on a ticket detail page
    socket.on('join:ticket', (ticketId: string) => {
      socket.join(`ticket:${ticketId}`);
      console.log(`Socket ${socket.id} joined ticket: ${ticketId}`);
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
}

// ── Emit helpers ─────────────────────────────────────────
// These functions are called from the route handlers
// to broadcast events to connected clients

// Called when a new ticket is created
// Notifies all agents in the organization instantly
export function emitTicketCreated(io: Server, organizationId: string, ticket: any): void {
  io.to(organizationId).emit('ticket:created', ticket);
}

// Called when a new message is added to a ticket
// Notifies everyone viewing that ticket
export function emitNewMessage(io: Server, ticketId: string, message: any): void {
  io.to(`ticket:${ticketId}`).emit('message:new', message);
}

// Called when a ticket status changes (e.g. closed)
export function emitTicketUpdated(io: Server, organizationId: string, ticket: any): void {
  io.to(organizationId).emit('ticket:updated', ticket);
}