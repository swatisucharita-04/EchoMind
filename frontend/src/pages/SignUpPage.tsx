import { SignUp } from '@clerk/clerk-react'

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 to-purple-50 dark:from-gray-950 dark:to-gray-900 p-4">
      <div className="flex flex-col items-center gap-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Start your journey</h1>
          <p className="text-gray-500 text-sm mt-1">Create your free EchoMind account</p>
        </div>
        <SignUp
          path="/sign-up"
          routing="path"
          signInUrl="/sign-in"
          fallbackRedirectUrl="/dashboard"
          appearance={{
            variables: { colorPrimary: '#4f5eff', borderRadius: '12px' },
          }}
        />
      </div>
    </div>
  )
}
