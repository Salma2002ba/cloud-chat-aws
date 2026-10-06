export enum RoomType {
  GENERAL = 'GENERAL',
  PRIVATE = 'PRIVATE'
}

export enum RoomRole {
  OWNER = 'OWNER',
  MEMBER = 'MEMBER'
}

export enum InvitationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED'
}

export type RoomTheme = 'indigo' | 'rose' | 'emerald' | 'amber' | 'slate' | 'purple';

export type SidebarTheme = 'default' | 'ocean' | 'midnight' | 'sunset' | 'forest' | 'lavender';

export interface User {
  id: number;
  username: string;
  email: string;
  passwordHash?: string;
  avatarUrl?: string;
  sidebarTheme?: SidebarTheme;
  createdAt?: string;
}

export interface Room {
  id: number;
  name: string;
  type: RoomType;
  ownerUserId: number;
  theme?: RoomTheme;
  createdAt: string;
}

export interface RoomMember {
  roomId: number;
  userId: number;
  role: RoomRole;
  joinedAt: string;
}

export interface Invitation {
  id: number;
  roomId: number;
  inviterUserId: number;
  inviteeUserId: number;
  status: InvitationStatus;
  createdAt: string;
  roomName?: string;
  inviterName?: string;
}

export interface Message {
  id: number;
  roomId: number;
  authorUserId: number;
  content: string;
  createdAt: string;
  authorName?: string;
  replyToId?: number | null;
  replyToContent?: string;
  replyToAuthorName?: string;
}

export interface AuthSession {
  token: string;
  user: User;
}

export interface PublicProfile {
  user: User;
  commonRooms: Room[];
}
