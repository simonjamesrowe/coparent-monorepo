/**
 * Task 8.2: Family setup form component
 * Form to create family unit with name and children information
 * See: spec.md "Family Setup Component" (lines 1105-1110) and Flow 2 (lines 66-79)
 */

import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useForm, useFieldArray, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { apiClient } from '@/lib/api-client'
import { useFamilyStore } from '@/stores/familyStore'
import { FamilyCreateResponse } from '@/types'

// Validation schema
const familySetupSchema = z.object({
  name: z.string().min(1, 'Family name is required').min(2, 'Family name must be at least 2 characters'),
  children: z.array(
    z.object({
      name: z.string().min(1, 'Child name is required'),
      date_of_birth: z.string().refine(
        (date) => {
          const parsed = new Date(date)
          return !isNaN(parsed.getTime())
        },
        'Valid date of birth is required'
      ),
    })
  )
    .min(1, 'At least one child is required')
    .max(10, 'Maximum 10 children allowed'),
})

type FamilySetupFormData = z.infer<typeof familySetupSchema>

export function FamilySetup() {
  const navigate = useNavigate()
  const { setFamily } = useFamilyStore()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { control, register, handleSubmit, formState: { errors } } = useForm<FamilySetupFormData>({
    resolver: zodResolver(familySetupSchema),
    defaultValues: {
      name: '',
      children: [{ name: '', date_of_birth: '' }],
    },
  })

  const { fields: childFields, append: appendChild, remove: removeChild } = useFieldArray({
    control,
    name: 'children',
  })

  const onSubmit: SubmitHandler<FamilySetupFormData> = async (data) => {
    setSubmitError(null)
    setIsSubmitting(true)

    try {
      const response = await apiClient.post<FamilyCreateResponse>('/v1/families', {
        name: data.name,
        children: data.children,
      })

      // Update store with family
      setFamily(response.family)

      // Redirect to dashboard
      navigate({ to: '/dashboard' })
    } catch (err) {
      setSubmitError(apiClient.getErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-calm-50 to-harbor-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-harbor-900 mb-2">Set Up Your Family</h1>
          <p className="text-gray-600 mb-8">Let's start by creating your family unit and adding your children</p>

          {submitError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded text-red-800">
              <p className="font-semibold">Setup Failed</p>
              <p className="text-sm mt-1">{submitError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Family Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Family Name *
              </label>
              <input
                {...register('name')}
                id="name"
                type="text"
                placeholder="e.g., Smith Family"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-harbor-500 focus:border-transparent"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            {/* Children Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Children</h3>

              {childFields.map((field, index) => (
                <div key={field.id} className="mb-4 p-4 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-gray-700">Child {index + 1}</h4>
                    {childFields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeChild(index)}
                        className="text-sm text-red-600 hover:text-red-700 font-medium"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor={`children.${index}.name`} className="block text-sm font-medium text-gray-700 mb-1">
                        Name *
                      </label>
                      <input
                        {...register(`children.${index}.name`)}
                        id={`children.${index}.name`}
                        type="text"
                        placeholder="Child's full name"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-harbor-500 focus:border-transparent"
                      />
                      {errors.children?.[index]?.name && (
                        <p className="mt-1 text-sm text-red-600">{errors.children[index].name.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor={`children.${index}.date_of_birth`} className="block text-sm font-medium text-gray-700 mb-1">
                        Date of Birth *
                      </label>
                      <input
                        {...register(`children.${index}.date_of_birth`)}
                        id={`children.${index}.date_of_birth`}
                        type="date"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-harbor-500 focus:border-transparent"
                      />
                      {errors.children?.[index]?.date_of_birth && (
                        <p className="mt-1 text-sm text-red-600">{errors.children[index].date_of_birth.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {errors.children?.root && (
                <p className="mt-2 text-sm text-red-600">{errors.children.root.message}</p>
              )}

              <button
                type="button"
                onClick={() => appendChild({ name: '', date_of_birth: '' })}
                disabled={childFields.length >= 10}
                className="mt-4 px-4 py-2 text-harbor-600 border border-harbor-300 rounded-lg hover:bg-harbor-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition"
              >
                + Add Another Child
              </button>
            </div>

            {/* Submit */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 bg-harbor-600 text-white font-semibold rounded-lg hover:bg-harbor-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {isSubmitting ? 'Creating Family...' : 'Create Family'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
