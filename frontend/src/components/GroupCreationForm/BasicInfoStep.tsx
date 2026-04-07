import React from 'react'
import { WizardStep } from '../wizard/WizardStep'
import { FormField } from './FormComponents'
import { GroupFormData, FormErrors } from './types'

interface BasicInfoStepProps {
  formData: GroupFormData
  errors: FormErrors
  touched: Record<string, boolean>
  onNext: () => void
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  groupNameRef?: React.Ref<HTMLInputElement>
}

/**
 * Step 1: Basic Information
 */
export const BasicInfoStep: React.FC<BasicInfoStepProps> = ({
  formData,
  errors,
  touched,
  onNext,
  onChange,
  onBlur,
  groupNameRef,
}) => {
  const inputCls = (name: keyof FormErrors) =>
    `glass-input w-full px-4 py-3 rounded-lg transition ${
      touched[name] && errors[name] ? 'border-red-500' : ''
    }`

  return (
    <WizardStep
      title="Basic Information"
      description="Give your group a name and describe its purpose"
      onNext={onNext}
      canProceed={
        !!formData.groupName.trim() && formData.groupName.trim().length >= 3
      }
    >
      <FormField
        id="groupName"
        label="Group Name *"
        touched={touched.groupName}
        error={errors.groupName}
        input={
          <input
            ref={groupNameRef}
            id="groupName"
            name="groupName"
            type="text"
            value={formData.groupName}
            onChange={onChange}
            onBlur={onBlur}
            placeholder="e.g., Market Women Ajo"
            className={inputCls('groupName')}
            aria-required="true"
            aria-invalid={touched.groupName && !!errors.groupName}
          />
        }
      />
      <FormField
        id="description"
        label="Description (optional)"
        touched={touched.description}
        error={errors.description}
        input={
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={onChange}
            onBlur={onBlur}
            rows={2}
            placeholder="Describe your group's purpose..."
            className={inputCls('description')}
          />
        }
      />
      <FormField
        id="category"
        label="Category"
        touched={touched.category}
        error={errors.category}
        input={
          <select
            id="category"
            name="category"
            value={formData.category || 'All'}
            onChange={onChange}
            onBlur={onBlur as any}
            className={inputCls('category' as any)}
          >
            <option value="All">Select a category</option>
            <option value="Startup">Startup</option>
            <option value="Education">Education</option>
            <option value="Real Estate">Real Estate</option>
            <option value="Emergency Fund">Emergency Fund</option>
            <option value="Travel">Travel</option>
            <option value="Festivals">Festivals</option>
            <option value="Farming">Farming</option>
          </select>
        }
      />
    </WizardStep>
  )
}
