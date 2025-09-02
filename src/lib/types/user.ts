export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen: Date;
  position: {
    x: number;
    y: number;
  };
  color: string;
}

export interface UserSession {
  id: string;
  user: User;
  joinedAt: Date;
  permissions: UserPermission[];
}

export type UserPermission = "view" | "edit" | "comment" | "admin";

export interface UserPreferences {
  theme: "light" | "dark" | "auto";
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    sound: boolean;
  };
}
