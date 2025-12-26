/**
 * Auth0 Management API Client - Phase 2, Task 2.4
 * Syncs roles between local database and Auth0
 */

import axios, { AxiosInstance } from 'axios';
import logger from '../utils/logger';

interface Auth0Role {
  id: string;
  name: string;
  description: string;
}

export class Auth0ManagementAPI {
  private client: AxiosInstance;
  private token: string = '';
  private tokenExpiry: number = 0;

  constructor() {
    this.client = axios.create({
      baseURL: `https://${process.env.AUTH0_MANAGEMENT_API_DOMAIN}/api/v2`,
      timeout: 5000,
    });
  }

  /**
   * Get Management API access token
   */
  private async getAccessToken(): Promise<string> {
    // Return cached token if still valid
    if (this.token && this.tokenExpiry > Date.now()) {
      return this.token;
    }

    try {
      const response = await axios.post(
        `https://${process.env.AUTH0_MANAGEMENT_API_DOMAIN}/oauth/token`,
        {
          client_id: process.env.AUTH0_MANAGEMENT_API_CLIENT_ID,
          client_secret: process.env.AUTH0_MANAGEMENT_API_CLIENT_SECRET,
          audience: `https://${process.env.AUTH0_MANAGEMENT_API_DOMAIN}/api/v2/`,
          grant_type: 'client_credentials',
        }
      );

      this.token = response.data.access_token;
      this.tokenExpiry = Date.now() + (response.data.expires_in * 1000);

      return this.token;
    } catch (error) {
      logger.error('Failed to get Auth0 Management API token', error);
      throw error;
    }
  }

  /**
   * Add role to user
   */
  async addRoleToUser(auth0_id: string, role: string): Promise<void> {
    try {
      const token = await this.getAccessToken();

      const roleIds = await this.getRoleIdsByName([role]);
      if (roleIds.length === 0) {
        throw new Error(`Role '${role}' not found in Auth0`);
      }

      await this.client.post(`/users/${auth0_id}/roles`, {
        roles: [roleIds[0]],
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      logger.info('Role added to Auth0 user', {
        auth0_id,
        role,
      });
    } catch (error) {
      logger.error('Failed to add role to Auth0 user', {
        error,
        auth0_id,
        role,
      });
      throw error;
    }
  }

  /**
   * Remove role from user
   */
  async removeRoleFromUser(auth0_id: string, role: string): Promise<void> {
    try {
      const token = await this.getAccessToken();

      const roleIds = await this.getRoleIdsByName([role]);
      if (roleIds.length === 0) {
        throw new Error(`Role '${role}' not found in Auth0`);
      }

      await this.client.delete(`/users/${auth0_id}/roles`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { roles: [roleIds[0]] },
      });

      logger.info('Role removed from Auth0 user', {
        auth0_id,
        role,
      });
    } catch (error) {
      logger.error('Failed to remove role from Auth0 user', {
        error,
        auth0_id,
        role,
      });
      throw error;
    }
  }

  /**
   * Get user roles from Auth0
   */
  async getUserRoles(auth0_id: string): Promise<string[]> {
    try {
      const token = await this.getAccessToken();

      const response = await this.client.get(`/users/${auth0_id}/roles`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return response.data.map((role: Auth0Role) => role.name);
    } catch (error) {
      logger.error('Failed to get user roles from Auth0', {
        error,
        auth0_id,
      });
      throw error;
    }
  }

  /**
   * Get role IDs by name
   * Used internally for role synchronization
   */
  private async getRoleIdsByName(roleNames: string[]): Promise<string[]> {
    try {
      const token = await this.getAccessToken();

      const response = await this.client.get('/roles', {
        headers: { Authorization: `Bearer ${token}` },
        params: { include_totals: true, per_page: 50 },
      });

      const roles = response.data.roles || [];
      return roleNames
        .map((name) => {
          const role = roles.find((r: Auth0Role) => r.name === name);
          return role?.id;
        })
        .filter((id: any) => id !== undefined);
    } catch (error) {
      logger.error('Failed to get role IDs', { error });
      throw error;
    }
  }

  /**
   * Sync roles between local database and Auth0
   * Ensures consistency
   */
  async syncRoles(auth0_id: string, roles: string[]): Promise<void> {
    try {
      const currentRoles = await this.getUserRoles(auth0_id);

      // Add missing roles
      for (const role of roles) {
        if (!currentRoles.includes(role)) {
          await this.addRoleToUser(auth0_id, role);
        }
      }

      // Remove extra roles (that are no longer needed)
      for (const role of currentRoles) {
        if (!roles.includes(role) && ['ADMIN_PARENT', 'CO_PARENT'].includes(role)) {
          await this.removeRoleFromUser(auth0_id, role);
        }
      }

      logger.info('Roles synced with Auth0', {
        auth0_id,
        roles,
      });
    } catch (error) {
      logger.error('Failed to sync roles', {
        error,
        auth0_id,
      });
      throw error;
    }
  }
}

export const auth0ManagementAPI = new Auth0ManagementAPI();
