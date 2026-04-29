// Validation utilities

export const validatePassword = (password) => {
  if (!password || password.trim() === '') {
    return { valid: false, message: 'Password cannot be empty' };
  }
  if (password.length < 6) {
    return { valid: false, message: 'Password must be at least 6 characters long' };
  }
  return { valid: true, message: 'Password is valid' };
};

export const validateUsername = (username) => {
  if (!username || username.trim() === '') {
    return { valid: false, message: 'Username cannot be empty' };
  }
  if (username.length < 3) {
    return { valid: false, message: 'Username must be at least 3 characters' };
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return { valid: false, message: 'Username can only contain letters, numbers, hyphens, and underscores' };
  }
  return { valid: true, message: 'Username is valid' };
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, message: 'Invalid email format' };
  }
  return { valid: true, message: 'Email is valid' };
};

export const validateName = (name) => {
  if (!name || name.trim() === '') {
    return { valid: false, message: 'Name cannot be empty' };
  }
  if (name.length < 2) {
    return { valid: false, message: 'Name must be at least 2 characters' };
  }
  return { valid: true, message: 'Name is valid' };
};
