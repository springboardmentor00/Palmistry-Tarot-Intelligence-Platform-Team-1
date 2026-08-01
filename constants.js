export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const APP_NAME = 'Palmistry & Tarot Intelligence Platform';
export const APP_VERSION = '1.0.0';

export const ROLES = {
  USER: 'user',
  TAROT_READER: 'tarot_reader',
  SPIRITUAL_CONSULTANT: 'spiritual_consultant',
  ADMIN: 'admin'
};

export const ROLE_LABELS = {
  [ROLES.USER]: 'User',
  [ROLES.TAROT_READER]: 'Tarot Reader',
  [ROLES.SPIRITUAL_CONSULTANT]: 'Spiritual Consultant',
  [ROLES.ADMIN]: 'Administrator'
};

export const SPIRITUAL_INTERESTS = [
  'Palmistry', 'Tarot Reading', 'Astrology', 'Numerology',
  'Crystal Healing', 'Meditation', 'Chakra Balancing',
  'Aura Reading', 'Runes', 'I Ching', 'Angel Cards'
];

export const SPIRITUAL_GOALS = [
  'Self Discovery', 'Career Guidance', 'Relationship Harmony',
  'Spiritual Growth', 'Mental Wellness', 'Financial Abundance',
  'Health & Healing', 'Life Purpose', 'Inner Peace'
];

export const READING_PREFERENCES = [
  'Love & Relationships', 'Career & Finance', 'Health & Wellness',
  'Spiritual Growth', 'Life Path', 'Family & Home'
];

export const AGE_GROUPS = ['18-25', '26-35', '36-45', '46-55', '55+'];

export const EXPERIENCE_LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' }
];

export const GOOGLE_AUTH_URL = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your-client-id'}&redirect_uri=${import.meta.env.VITE_GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/callback/google'}&response_type=code&scope=email profile`;

export const GITHUB_AUTH_URL = `https://github.com/login/oauth/authorize?client_id=${import.meta.env.VITE_GITHUB_CLIENT_ID || 'your-client-id'}&redirect_uri=${import.meta.env.VITE_GITHUB_REDIRECT_URI || 'http://localhost:3000/auth/callback/github'}&scope=user:email`;