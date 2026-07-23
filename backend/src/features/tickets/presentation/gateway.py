import socketio

# Initialize the asynchronous Socket.IO server compatible with ASGI (Uvicorn)
sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')

@sio.event
async def connect(sid, environ):
    print(f"Client connected: {sid}")

@sio.on('join:organization')
async def handle_join_organization(sid, organization_id):
    # Join room representing the organization ID
    await sio.enter_room(sid, str(organization_id))
    print(f"Socket {sid} joined org: {organization_id}")

@sio.on('join:ticket')
async def handle_join_ticket(sid, ticket_id):
    # Join room representing the ticket details conversation thread
    await sio.enter_room(sid, f"ticket:{ticket_id}")
    print(f"Socket {sid} joined ticket: {ticket_id}")

@sio.event
async def disconnect(sid):
    print(f"Client disconnected: {sid}")

# Broadcast helper functions
async def emit_ticket_created(organization_id: str, ticket: dict) -> None:
    await sio.emit('ticket:created', ticket, room=str(organization_id))

async def emit_new_message(ticket_id: str, message: dict) -> None:
    await sio.emit('message:new', message, room=f"ticket:{ticket_id}")

async def emit_ticket_updated(organization_id: str, ticket: dict) -> None:
    await sio.emit('ticket:updated', ticket, room=str(organization_id))
