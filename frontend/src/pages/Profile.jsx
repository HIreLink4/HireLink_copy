import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useForm } from 'react-hook-form'
import { userAPI } from '../services/api'
import { useAuthStore } from '../context/authStore'
import toast from 'react-hot-toast'
import { 
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon
} from '@heroicons/react/24/outline'

export default function Profile() {
  const { user, updateUser } = useAuthStore()
  const queryClient = useQueryClient()
  const [editMode, setEditMode] = useState(false)
  const [showAddressForm, setShowAddressForm] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      name: user?.name,
      email: user?.email,
    }
  })

  const { register: registerAddress, handleSubmit: handleAddressSubmit, reset: resetAddress, formState: { errors: addressErrors } } = useForm()

  const { data: addressData, isLoading: addressLoading } = useQuery(
    'addresses',
    userAPI.getAddresses
  )

  const updateMutation = useMutation(
    (data) => userAPI.updateProfile(data),
    {
      onSuccess: (response) => {
        updateUser(response.data.data)
        toast.success('Profile updated successfully')
        setEditMode(false)
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update profile')
      }
    }
  )

  const addAddressMutation = useMutation(
    (data) => userAPI.addAddress(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('addresses')
        toast.success('Address added successfully')
        setShowAddressForm(false)
        resetAddress()
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to add address')
      }
    }
  )

  const deleteAddressMutation = useMutation(
    (id) => userAPI.deleteAddress(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('addresses')
        toast.success('Address deleted')
      }
    }
  )

  const addresses = addressData?.data?.data || []

  const onSubmit = (data) => {
    updateMutation.mutate(data)
  }

  const onAddAddress = (data) => {
    addAddressMutation.mutate(data)
  }

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-primary-600 text-2xl font-bold">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{user?.name}</h1>
              <p className="text-primary-100">{user?.userType?.toLowerCase()} account</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Profile Info */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
            {!editMode && (
              <button
                onClick={() => setEditMode(true)}
                className="btn-ghost text-sm"
              >
                <PencilIcon className="h-4 w-4 mr-1" />
                Edit
              </button>
            )}
          </div>

          {editMode ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-2">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    {...register('name', { required: 'Name is required' })}
                    className={`input pl-12 ${errors.name ? 'input-error' : ''}`}
                  />
                </div>
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-2">Email</label>
                <div className="relative">
                  <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    {...register('email')}
                    className="input pl-12"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={updateMutation.isLoading} className="btn-primary">
                  {updateMutation.isLoading ? 'Saving...' : 'Save Changes'}
                </button>
                <button 
                  type="button" 
                  onClick={() => { setEditMode(false); reset(); }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <UserIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{user?.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <PhoneIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{user?.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{user?.email || 'Not provided'}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Addresses */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Saved Addresses</h2>
            {!showAddressForm && (
              <button
                onClick={() => setShowAddressForm(true)}
                className="btn-primary text-sm"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Add Address
              </button>
            )}
          </div>

          {showAddressForm && (
            <form onSubmit={handleAddressSubmit(onAddAddress)} className="mb-6 p-4 bg-gray-50 rounded-xl space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm text-gray-600 mb-1">Address Label</label>
                  <input
                    {...registerAddress('addressLabel')}
                    className="input"
                    placeholder="e.g., Home, Office"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm text-gray-600 mb-1">Address Line 1 *</label>
                  <input
                    {...registerAddress('addressLine1', { required: true })}
                    className={`input ${addressErrors.addressLine1 ? 'input-error' : ''}`}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm text-gray-600 mb-1">Address Line 2</label>
                  <input {...registerAddress('addressLine2')} className="input" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">City *</label>
                  <input
                    {...registerAddress('city', { required: true })}
                    className={`input ${addressErrors.city ? 'input-error' : ''}`}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">State *</label>
                  <input
                    {...registerAddress('state', { required: true })}
                    className={`input ${addressErrors.state ? 'input-error' : ''}`}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Pincode *</label>
                  <input
                    {...registerAddress('pincode', { required: true, pattern: /^[0-9]{6}$/ })}
                    className={`input ${addressErrors.pincode ? 'input-error' : ''}`}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Landmark</label>
                  <input {...registerAddress('landmark')} className="input" />
                </div>
              </div>
              <label className="flex items-center gap-2">
                <input type="checkbox" {...registerAddress('isDefault')} className="rounded" />
                <span className="text-sm text-gray-600">Set as default address</span>
              </label>
              <div className="flex gap-3">
                <button type="submit" disabled={addAddressMutation.isLoading} className="btn-primary">
                  {addAddressMutation.isLoading ? 'Saving...' : 'Save Address'}
                </button>
                <button 
                  type="button" 
                  onClick={() => { setShowAddressForm(false); resetAddress(); }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {addressLoading ? (
            <div className="animate-pulse space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-20 bg-gray-100 rounded-xl"></div>
              ))}
            </div>
          ) : addresses.length > 0 ? (
            <div className="space-y-3">
              {addresses.map((address) => (
                <div key={address.addressId} className="flex items-start justify-between p-4 border rounded-xl">
                  <div className="flex items-start gap-3">
                    <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{address.addressLabel || address.addressType}</span>
                        {address.isDefault && (
                          <span className="badge-primary text-xs">Default</span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mt-1">
                        {address.addressLine1}
                        {address.addressLine2 && `, ${address.addressLine2}`}
                      </p>
                      <p className="text-gray-500 text-sm">
                        {address.city}, {address.state} - {address.pincode}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteAddressMutation.mutate(address.addressId)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No saved addresses</p>
          )}
        </div>

        {/* Account Info */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Account Type</span>
              <span className="font-medium capitalize">{user?.userType?.toLowerCase()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Account Status</span>
              <span className="badge-success">{user?.accountStatus}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Phone Verified</span>
              <span className={user?.isPhoneVerified ? 'text-green-600' : 'text-gray-400'}>
                {user?.isPhoneVerified ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Email Verified</span>
              <span className={user?.isEmailVerified ? 'text-green-600' : 'text-gray-400'}>
                {user?.isEmailVerified ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
