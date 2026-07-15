import { Server } from 'socket.io';

// Real-time gateway — notifies connected clients when ticket events occur
export function registerTicketGateway(io: Server): void {

  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Join an organization room — user only receives events for their own org
    socket.on('join:organization', (organizationId: number | string) => {
      socket.join(String(organizationId));
      console.log(`Socket ${socket.id} joined org: ${organizationId}`);
    });

    // Join a ticket room — used for real-time message updates on a ticket detail page
    socket.on('join:ticket', (ticketId: number | string) => {
      socket.join(`ticket:${ticketId}`);
      console.log(`Socket ${socket.id} joined ticket: ${ticketId}`);
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
}

// Broadcast a new ticket to all agents in the organization
export function emitTicketCreated(io: Server, organizationId: string, ticket: any): void {
  io.to(organizationId).emit('ticket:created', ticket);
}

// Broadcast a new message to everyone viewing that ticket
export function emitNewMessage(io: Server, ticketId: string, message: any): void {
  io.to(`ticket:${ticketId}`).emit('message:new', message);
}

// Broadcast a ticket update (e.g. status change) to the organization
export function emitTicketUpdated(io: Server, organizationId: string, ticket: any): void {
  io.to(organizationId).emit('ticket:updated', ticket);
}