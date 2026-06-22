import { defineStore } from 'pinia';
import { apiRequest, readSessionToken, writeSessionToken } from '../services/api.js';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: readSessionToken(),
    user: null
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.token),
    mustChangeCredentials: (state) => Boolean(state.user?.mustChangeCredentials)
  },
  actions: {
    setToken(token) {
      this.token = token;
      writeSessionToken(token);
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
    async getGithubOAuthStatus() {
      return apiRequest('/auth/github/status');
    },
    async getGithubOAuthSettings() {
      return apiRequest('/security/github-oauth');
    },
    async updateGithubOAuthSettings(payload) {
      return apiRequest('/security/github-oauth', {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
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
