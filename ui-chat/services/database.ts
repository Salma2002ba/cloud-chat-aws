import { User, Room, RoomMember, Invitation, Message, RoomType, RoomRole, InvitationStatus, RoomTheme } from '../types';

/**
 * Mock Database implementation to simulate PostgreSQL tables.
 * Persists in LocalStorage for development purposes.
 */
class MockDatabase {
  private users: User[] = [];
  private rooms: Room[] = [];
  private members: RoomMember[] = [];
  private invitations: Invitation[] = [];
  private messages: Message[] = [];

  constructor() {
    this.load();
    this.seed();
  }

  private save() {
    localStorage.setItem('chat_db_users', JSON.stringify(this.users));
    localStorage.setItem('chat_db_rooms', JSON.stringify(this.rooms));
    localStorage.setItem('chat_db_members', JSON.stringify(this.members));
    localStorage.setItem('chat_db_invitations', JSON.stringify(this.invitations));
    localStorage.setItem('chat_db_messages', JSON.stringify(this.messages));
  }

  private load() {
    this.users = JSON.parse(localStorage.getItem('chat_db_users') || '[]');
    this.rooms = JSON.parse(localStorage.getItem('chat_db_rooms') || '[]');
    this.members = JSON.parse(localStorage.getItem('chat_db_members') || '[]');
    this.invitations = JSON.parse(localStorage.getItem('chat_db_invitations') || '[]');
    this.messages = JSON.parse(localStorage.getItem('chat_db_messages') || '[]');
  }

  private seed() {
    if (this.rooms.length === 0) {
      const generalId = 'general-room-001';
      this.rooms.push({
        id: generalId,
        name: 'Général',
        type: RoomType.GENERAL,
        ownerUserId: 'system',
        theme: 'indigo',
        createdAt: new Date().toISOString()
      });
      this.save();
    }
  }

  // Users
  addUser(user: User) { this.users.push(user); this.save(); }
  findUserByEmail(email: string) { return this.users.find(u => u.email === email); }
  findUserById(id: string) { return this.users.find(u => u.id === id); }
  findUserByUsername(username: string) { return this.users.find(u => u.username === username); }
  updateUser(id: string, updates: Partial<User>) {
    const idx = this.users.findIndex(u => u.id === id);
    if (idx !== -1) { this.users[idx] = { ...this.users[idx], ...updates }; this.save(); }
  }
  getAllUsers() { return [...this.users]; }

  // Rooms
  addRoom(room: Room) { this.rooms.push(room); this.save(); }
  findRoomById(id: string) { return this.rooms.find(r => r.id === id); }
  updateRoomTheme(roomId: string, theme: RoomTheme) {
    const room = this.findRoomById(roomId);
    if (room) {
      room.theme = theme;
      this.save();
    }
  }
  getRoomsForUser(userId: string) {
    const memberships = this.members.filter(m => m.userId === userId).map(m => m.roomId);
    return this.rooms.filter(r => r.type === RoomType.GENERAL || memberships.includes(r.id));
  }

  // Members
  addMember(member: RoomMember) { this.members.push(member); this.save(); }
  isMember(roomId: string, userId: string) {
    const room = this.findRoomById(roomId);
    if (room?.type === RoomType.GENERAL) return true;
    return this.members.some(m => m.roomId === roomId && m.userId === userId);
  }
  getRoomRole(roomId: string, userId: string) {
    return this.members.find(m => m.roomId === roomId && m.userId === userId)?.role;
  }

  getCommonRooms(userId1: string, userId2: string): Room[] {
    const rooms1 = this.getRoomsForUser(userId1);
    const rooms2 = this.getRoomsForUser(userId2);
    const ids2 = new Set(rooms2.map(r => r.id));
    return rooms1.filter(r => ids2.has(r.id));
  }

  // Invitations
  addInvitation(inv: Invitation) { this.invitations.push(inv); this.save(); }
  getInvitationsForUser(userId: string) {
    return this.invitations.filter(i => i.inviteeUserId === userId && i.status === InvitationStatus.PENDING);
  }
  updateInvitation(id: string, status: InvitationStatus) {
    const idx = this.invitations.findIndex(i => i.id === id);
    if (idx !== -1) { this.invitations[idx].status = status; this.save(); return this.invitations[idx]; }
  }

  // Messages
  addMessage(msg: Message) { this.messages.push(msg); this.save(); return msg; }
  getMessages(roomId: string, since?: string) {
    let filtered = this.messages.filter(m => m.roomId === roomId);
    if (since) {
      filtered = filtered.filter(m => new Date(m.createdAt) > new Date(since));
    }
    return filtered.map(m => ({
      ...m,
      authorName: this.findUserById(m.authorUserId)?.username || 'Inconnu'
    }));
  }
}

export const db = new MockDatabase();
