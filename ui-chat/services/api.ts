import { RoomType, InvitationStatus, RoomTheme, PublicProfile } from '../types';
import { getAuthHeaders } from "./api-helper";

const API_BASE = import.meta.env.VITE_CHAT_API_URL || "http://localhost:3002";
const AUTH_BASE = import.meta.env.VITE_AUTH_API_URL || "http://localhost:3001";

export const api = {
  auth: {
    register: async (username: string, email: string, password: string) => {
      const res = await fetch(`${AUTH_BASE}/auth/register`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ username, email, password })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Erreur lors de l'inscription");
      }

      return await res.json();
    },

    login: async (email: string, password: string) => {
      const res = await fetch(`${AUTH_BASE}/auth/login`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ identifier: email, password })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Identifiants invalides");
      }

      return await res.json();
    },

    changePassword: async (userId: string, oldPassword: string, newPassword: string) => {
      const res = await fetch(`${AUTH_BASE}/auth/change-password`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ userId, oldPassword, newPassword })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Erreur lors du changement de mot de passe");
      }

      return true;
    }
  },

  rooms: {
    create: async (userId: number, name: string, type: RoomType, theme?: RoomTheme) => {
      const res = await fetch(`${API_BASE}/rooms`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name,
          type,
          ownerUserId: userId,
          theme: theme || 'indigo'
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Erreur lors de la création du salon");
      }

      return await res.json();
    },

    list: async (userId: number) => {
      const res = await fetch(`${API_BASE}/users/${userId}/rooms`, { headers: getAuthHeaders() });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Erreur lors du chargement des salons");
      }

      return await res.json();
    },

    updateTheme: async (roomId: number, theme: RoomTheme) => {
      const res = await fetch(`${API_BASE}/rooms/${roomId}/theme`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ theme })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Erreur lors de la mise à jour du thème");
      }

      return true;
    },

    getById: async (roomId: number) => {
      const res = await fetch(`${API_BASE}/rooms/${roomId}`, { headers: getAuthHeaders() });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Erreur lors du chargement du salon");
      }

      return await res.json();
    },

    delete: async (roomId: number, userId: number) => {
      const res = await fetch(`${API_BASE}/rooms/${roomId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
        body: JSON.stringify({ userId })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Erreur lors de la suppression du salon");
      }

      return true;
    },

    rename: async (roomId: number, userId: number, name: string) => {
      const res = await fetch(`${API_BASE}/rooms/${roomId}/name`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ userId, name })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Erreur lors du renommage du salon");
      }

      return true;
    },

    getMembers: async (roomId: number) => {
      const res = await fetch(`${API_BASE}/rooms/${roomId}/members`, { headers: getAuthHeaders() });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Erreur lors du chargement des membres");
      }

      return await res.json();
    }
  },

  invitations: {
    send: async (roomId: number, inviterUserId: number, inviteeUsername: string) => {
      const res = await fetch(`${API_BASE}/invitations`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          roomId,
          inviterUserId,
          inviteeUsername
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Erreur lors de l'envoi de l'invitation");
      }

      return await res.json();
    },

    list: async (userId: number) => {
      const res = await fetch(`${API_BASE}/users/${userId}/invitations`, { headers: getAuthHeaders() });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Erreur lors du chargement des invitations");
      }

      return await res.json();
    },

    count: async (userId: number) => {
      const res = await fetch(`${API_BASE}/users/${userId}/invitations/count`, { headers: getAuthHeaders() });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Erreur lors du comptage des invitations");
      }

      const data = await res.json();
      return data.count || 0;
    },

    respond: async (invitationId: number, userId: number, status: InvitationStatus) => {
      const res = await fetch(`${API_BASE}/invitations/${invitationId}/respond`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ userId, status })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Erreur lors de la réponse à l'invitation");
      }

      return true;
    }
  },

  messages: {
    send: async (roomId: number, authorUserId: number, authorName: string, content: string, replyToId?: number) => {
      const res = await fetch(`${API_BASE}/rooms/${roomId}/messages`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          roomId,
          authorUserId,
          content,
          authorName,
          ...(replyToId ? { replyToId } : {})
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Erreur lors de l'envoi du message");
      }

      const row = await res.json();

      return {
        ...row,
        authorName: row.authorName || row.author_name || authorName
      };
    },

    list: async (roomId: number, since?: string) => {
      const url = new URL(`${API_BASE}/rooms/${roomId}/messages`);
      if (since) url.searchParams.set("since", since);

      const res = await fetch(url.toString(), { headers: getAuthHeaders() });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Erreur lors du chargement des messages");
      }

      const rows = await res.json();
      console.log("MESSAGE API SAMPLE:", rows[0]);

      return rows.map((row: any) => ({
        ...row,
        authorName: row.authorName || row.author_name || "Utilisateur"
      }));
    },

    delete: async (messageId: number, userId: number, roomId: number) => {
      const res = await fetch(`${API_BASE}/rooms/messages/${messageId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
        body: JSON.stringify({ userId, roomId })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Erreur lors de la suppression du message");
      }

      return true;
    },

    update: async (messageId: number, userId: number, content: string) => {
      const res = await fetch(`${API_BASE}/rooms/messages/${messageId}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ userId, content })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Erreur lors de la modification du message");
      }

      return await res.json();
    },

    search: async (roomId: number, query: string) => {
      const url = new URL(`${API_BASE}/rooms/${roomId}/messages/search`);
      url.searchParams.set("q", query);

      const res = await fetch(url.toString(), { headers: getAuthHeaders() });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Erreur lors de la recherche");
      }

      return await res.json();
    }
  },

  users: {
    search: async (query: string) => {
      // Cette fonctionnalité n'est pas encore implémentée dans le backend
      // On retourne un tableau vide pour l'instant
      console.warn('User search not implemented in backend yet');
      return [];
    },

    getPublicProfile: async (targetUserId: number, currentUserId: number): Promise<PublicProfile> => {
      const res = await fetch(`${API_BASE}/users/${targetUserId}/profile?currentUserId=${currentUserId}`, { headers: getAuthHeaders() });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Erreur lors du chargement du profil");
      }

      return await res.json();
    }
  }
};
