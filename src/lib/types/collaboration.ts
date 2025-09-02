export interface Comment {
  id: string;
  text: string;
  position: {
    x: number;
    y: number;
  };
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: Date;
  replies: Comment[];
  isResolved: boolean;
}

export interface CollaborationSession {
  id: string;
  name: string;
  participants: string[];
  startedAt: Date;
  isActive: boolean;
}

export interface ShareLink {
  id: string;
  url: string;
  permissions: string[];
  expiresAt?: Date;
  createdAt: Date;
  createdBy: string;
}

export interface UserCursor {
  id: string;
  userId: string;
  position: {
    x: number;
    y: number;
  };
  color: string;
  name: string;
  lastSeen: Date;
}

export interface CollaborationUser {
  id: string;
  name: string;
  color: string;
  position?: {
    x: number;
    y: number;
  };
  avatar?: string;
}
