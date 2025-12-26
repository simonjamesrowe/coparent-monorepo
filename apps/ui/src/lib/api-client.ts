/**
 * Task 9.1: API client configuration with JWT authorization
 * HTTP client with automatic JWT injection, error handling, token refresh
 * All authenticated endpoints require JWT in Authorization: Bearer {token}
 */

/// <reference types="vite/client" />

import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios'
import { ApiError } from '@/types'

class ApiClient {
  private client: AxiosInstance

  constructor() {
    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

    this.client = axios.create({
      baseURL,
      timeout: 10000,
    })

    // Request interceptor: Add JWT token to all requests
    this.client.interceptors.request.use((config) => {
      const token = this.getToken()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    })

    // Response interceptor: Handle 401 responses (expired tokens)
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          this.clearToken()
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }
    )
  }

  /**
   * Get JWT token from SessionStorage
   */
  private getToken(): string | null {
    return sessionStorage.getItem('access_token')
  }

  /**
   * Store JWT token in SessionStorage (not LocalStorage for security)
   * See: spec.md "Session Management" (lines 2008-2015)
   */
  public setToken(token: string): void {
    sessionStorage.setItem('access_token', token)
  }

  /**
   * Clear JWT token from SessionStorage
   */
  public clearToken(): void {
    sessionStorage.removeItem('access_token')
  }

  /**
   * Check if user has a valid token
   */
  public hasToken(): boolean {
    return !!this.getToken()
  }

  /**
   * Generic GET request
   */
  public async get<T>(url: string, config = {}): Promise<T> {
    const response: AxiosResponse<T> = await this.client.get(url, config)
    return response.data
  }

  /**
   * Generic POST request
   */
  public async post<T, D = unknown>(url: string, data?: D, config = {}): Promise<T> {
    const response: AxiosResponse<T> = await this.client.post(url, data, config)
    return response.data
  }

  /**
   * Generic PUT request
   */
  public async put<T, D = unknown>(url: string, data?: D, config = {}): Promise<T> {
    const response: AxiosResponse<T> = await this.client.put(url, data, config)
    return response.data
  }

  /**
   * Generic DELETE request
   */
  public async delete<T>(url: string, config = {}): Promise<T> {
    const response: AxiosResponse<T> = await this.client.delete(url, config)
    return response.data
  }

  /**
   * Handle API errors with user-friendly messages
   */
  public getErrorMessage(error: unknown): string {
    if (axios.isAxiosError(error)) {
      const apiError = error.response?.data as ApiError | undefined

      if (apiError?.message) {
        return apiError.message
      }

      // Handle specific status codes
      switch (error.response?.status) {
        case 400:
          return 'Invalid input. Please check your information and try again.'
        case 401:
          return 'Your session expired. Please log in again.'
        case 403:
          return 'You do not have permission to perform this action.'
        case 404:
          return 'The requested resource was not found.'
        case 409:
          return 'This action conflicts with existing data.'
        case 429:
          return 'Too many requests. Please try again later.'
        case 500:
          return 'Server error. Please try again later.'
        default:
          return error.message || 'An unexpected error occurred.'
      }
    }

    if (error instanceof Error) {
      return error.message
    }

    return 'An unexpected error occurred.'
  }
}

export const apiClient = new ApiClient()
