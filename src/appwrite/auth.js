import { ID } from 'appwrite';
import { account, isAppwriteConfigured } from './client';

/**
 * Authentication Service for RecallX using Appwrite Auth
 */
export const authService = {
  /**
   * Register a new user and create an initial session
   */
  async register(name, email, password) {
    if (!isAppwriteConfigured()) {
      throw new Error('Appwrite is not configured yet. Please enter your Project ID and Endpoint.');
    }

    try {
      // Create user account
      const newAccount = await account.create(
        ID.unique(),
        email.trim(),
        password,
        name.trim()
      );

      // Immediately log in upon successful registration
      await account.createEmailPasswordSession(email.trim(), password);

      return newAccount;
    } catch (error) {
      console.error('Registration failed:', error);
      throw new Error(this.formatErrorMessage(error));
    }
  },

  /**
   * Log in user with email and password
   */
  async login(email, password) {
    if (!isAppwriteConfigured()) {
      throw new Error('Appwrite is not configured yet. Please configure your Appwrite settings.');
    }

    try {
      // First check if there is an active session, if so delete it or reuse
      try {
        const current = await account.get();
        if (current) {
          // If already logged in with same email
          if (current.email.toLowerCase() === email.trim().toLowerCase()) {
            return current;
          }
          await account.deleteSession('current');
        }
      } catch {
        // No active session, continue
      }

      await account.createEmailPasswordSession(email.trim(), password);
      return await account.get();
    } catch (error) {
      console.error('Login failed:', error);
      throw new Error(this.formatErrorMessage(error));
    }
  },

  /**
   * Get currently authenticated user details
   */
  async getCurrentUser() {
    if (!isAppwriteConfigured()) {
      return null;
    }

    try {
      return await account.get();
    } catch {
      // Normal when user is not logged in (401)
      return null;
    }
  },

  /**
   * End current user session
   */
  async logout() {
    if (!isAppwriteConfigured()) {
      return true;
    }

    try {
      await account.deleteSession('current');
      return true;
    } catch (error) {
      console.warn('Logout error (session may already be deleted):', error);
      return true;
    }
  },

  /**
   * Format human-friendly Appwrite error messages
   */
  formatErrorMessage(error) {
    if (!error) return 'An unexpected error occurred.';
    
    const message = error.message || error.toString();

    if (message.includes('user_already_exists') || message.includes('already exists')) {
      return 'An account with this email address already exists. Please log in instead.';
    }
    if (message.includes('user_invalid_credentials') || message.includes('Invalid credentials')) {
      return 'Incorrect email or password. Please verify your credentials and try again.';
    }
    if (message.includes('password_too_short') || message.includes('Password must be at least')) {
      return 'Password must be at least 8 characters long.';
    }
    if (message.includes('user_email_invalid') || message.includes('Invalid `email`')) {
      return 'Please enter a valid email address.';
    }
    if (message.includes('Network Error') || message.includes('Failed to fetch')) {
      return 'Network connection error. Please verify your Appwrite Endpoint and CORS settings.';
    }

    return message;
  }
};
