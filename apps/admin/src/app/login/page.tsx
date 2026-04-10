import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

async function login(formData: FormData) {
  'use server'
  const password = formData.get('password') as string
  if (password === process.env.ADMIN_SECRET) {
    const cookieStore = await cookies()
    cookieStore.set('admin_auth', password, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })
    redirect('/')
  }
}

export default function LoginPage({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1A1A2E]">
      <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-2xl">
        <div className="text-center mb-8">
          <p className="text-3xl mb-2">🌴</p>
          <h1 className="text-2xl font-bold text-gray-900">SerendiGO</h1>
          <p className="text-gray-500 text-sm mt-1">Admin Panel</p>
        </div>

        <form action={login} className="space-y-4">
          <div>
            <label className="label">Password</label>
            <input
              name="password"
              type="password"
              className="input"
              placeholder="Enter admin password"
              required
              autoFocus
            />
          </div>
          <button type="submit" className="btn-primary w-full justify-center">
            Sign In
          </button>
        </form>
      </div>
    </div>
  )
}
