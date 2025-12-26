/**
 * Task 11.2: Integration tests for family creation
 * Test complete family creation flow
 * See: spec.md "Family Creation Flow" (lines 1496-1504)
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FamilySetup } from '@/components/family/FamilySetup'
import { apiClient } from '@/lib/api-client'

// Mock router
vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => vi.fn(),
  useSearch: () => ({}),
}))

describe('Family Creation Flow Integration', () => {
  it('should create family with name and children', async () => {
    const createSpy = vi.spyOn(apiClient, 'post')

    const user = userEvent.setup()
    render(<FamilySetup />)

    // Fill in family name
    const familyNameInput = screen.getByPlaceholderText('e.g., Smith Family')
    await user.type(familyNameInput, 'Test Family')

    // Fill in child information
    const childNameInput = screen.getByPlaceholderText('Child\'s full name')
    await user.type(childNameInput, 'Test Child')

    const dobInput = screen.getByDisplayValue('')
    await user.type(dobInput, '2015-01-01')

    // Submit form
    const submitButton = screen.getByText('Create Family')
    await user.click(submitButton)

    await waitFor(() => {
      expect(createSpy).toHaveBeenCalledWith('/v1/families', expect.objectContaining({
        name: 'Test Family',
        children: expect.arrayContaining([
          expect.objectContaining({
            name: 'Test Child',
            date_of_birth: '2015-01-01',
          }),
        ]),
      }))
    })

    createSpy.mockRestore()
  })

  it('should validate required fields', async () => {
    const user = userEvent.setup()
    render(<FamilySetup />)

    // Try to submit without filling required fields
    const submitButton = screen.getByText('Create Family')
    await user.click(submitButton)

    // Should show validation errors
    await waitFor(() => {
      expect(screen.getByText('Family name is required')).toBeInTheDocument()
    })
  })

  it('should enforce 1:1 family relationship', async () => {
    const createSpy = vi.spyOn(apiClient, 'post').mockRejectedValue(
      new Error('User already has a family')
    )

    const user = userEvent.setup()
    render(<FamilySetup />)

    // Fill and submit
    const familyNameInput = screen.getByPlaceholderText('e.g., Smith Family')
    await user.type(familyNameInput, 'Test Family')

    const childNameInput = screen.getByPlaceholderText('Child\'s full name')
    await user.type(childNameInput, 'Test Child')

    const dobInput = screen.getAllByDisplayValue('')[0]
    await user.type(dobInput, '2015-01-01')

    const submitButton = screen.getByText('Create Family')
    await user.click(submitButton)

    // Should show error
    await waitFor(() => {
      expect(screen.getByText(/setup failed/i)).toBeInTheDocument()
    })

    createSpy.mockRestore()
  })
})
