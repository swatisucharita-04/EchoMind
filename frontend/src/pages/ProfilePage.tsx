import { useUser, UserProfile } from '@clerk/clerk-react'
import { useAuthStore } from '@/store/authStore'

export default function ProfilePage() {
  const { user } = useUser()
  const appUser = useAuthStore((s) => s.appUser)

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-10">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage your account and preferences</p>
      </div>

      {/* App user info */}
      {appUser && (
        <div className="card p-5">
          <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-3">EchoMind Account</h3>
          <div className="flex items-center gap-4">
            {user?.imageUrl && (
              <img src={user.imageUrl} alt="Avatar" className="w-14 h-14 rounded-full object-cover" />
            )}
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">{appUser.display_name}</p>
              <p className="text-sm text-gray-500">{appUser.email}</p>
              <p className="text-xs text-gray-400 mt-0.5">Member since {new Date(appUser.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      )}

      {/* Clerk's built-in profile manager */}
      <div className="flex justify-center w-full mt-8">
        <UserProfile
          appearance={{
            variables: { colorPrimary: '#4f5eff', borderRadius: '12px' },
            elements: {
              rootBox: { width: '100%', display: 'flex', justifyContent: 'center' },
              card: { boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', border: '1px solid #f3f4f6' },
            },
          }}
        />
      </div>
    </div>
  )
}
