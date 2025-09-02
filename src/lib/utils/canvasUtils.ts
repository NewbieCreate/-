export const generateSafeUserId = (): string => {
  return `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const generateSafeUserName = (): string => {
  return `사용자-${Math.random().toString(36).substr(2, 8)}`;
};

export const generateSafeUniqueId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
