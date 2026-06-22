import { defineStore } from 'pinia';
import { apiRequest, TOKEN_KEY } from '../services/api.js';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem(TOKEN_KEY) || '',
    user: null
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.token),
    mustChangeCredentials: (state) => Boolean(state.user?.mustChangeCredentials)
  },
  actions: {
    setToken(token) {
      this.token = token;
      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
      } else {
        localStorage.removeItem(TOKEN_KEY);
      }
    },
    async login(credentials) {
      const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
      });
      this.setToken(data.token);
      this.user = data.user;
      return data;
    },
    async loadMe() {
      const data = await apiRequest('/auth/me');
      this.user = data.user;
      return data.user;
    },
    async updateProfile(payload) {
      const data = await apiRequest('/security/profile', {
        method: 'PATCH',
        body: JSON.stringify(payload)
      });
      this.user = data.user;
      return data.user;
    },
    async createGithubLink() {
      return apiRequest('/auth/github/link', {
        method: 'POST'
      });
    },
    logout() {
      this.user = null;
      this.setToken('');
    }
  }
});
