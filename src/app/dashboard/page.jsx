// app/dashboard/page.jsx

'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

export default function  Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      )
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
      
      if (!user) {
        router.push('/login')
      }
    }
    
    checkUser()
  }, [router])

  if (loading) {
    return <p>Loading...</p>
  }

  if (!user) {
    return null // The router will handle the redirect
  }

  console.log('User:', user)

  const connect = function (){
    window.location.href = "/api/google/connect";
  }

  const state = encodeURIComponent(
  JSON.stringify({ userId: user.id })
);

const googleAuthUrl =
  `https://accounts.google.com/o/oauth2/v2/auth` +
  `?client_id=${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}` +
  `&redirect_uri=${encodeURIComponent(process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_REDIRECT_URI)}` +
  `&response_type=code` +
  `&scope=https://www.googleapis.com/auth/analytics.readonly` +
  `&access_type=offline` +
  `&prompt=consent` +
  `&state=${state}`;

const googleSearchAuthUrl =
  "https://accounts.google.com/o/oauth2/v2/auth" +
  `?client_id=${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}` +
  `&redirect_uri=${encodeURIComponent(
    process.env.NEXT_PUBLIC_GOOGLE_SEARCH_CONSOLE_REDIRECT_URI
  )}` +
  `&response_type=code` +
  `&scope=${encodeURIComponent(
    "https://www.googleapis.com/auth/webmasters.readonly"
  )}` +
  `&access_type=offline` +
  `&prompt=consent` +
  `&include_granted_scopes=true` +
  `&state=${encodeURIComponent(state)}`;


  return (
    <div>
      <div className='text-3xl border-2 border-black flex flex-row gap-4 justify-center items-center p-4' style={{ fontFamily: "var(--font-story-script)" }}>    
        <a
          href={`https://connect.stripe.com/oauth/authorize?response_type=code&client_id=${process.env.NEXT_PUBLIC_STRIPE_CLIENT_ID}&scope=read_write&user_id=${user.id}`}
          className="p-4 border-4 border-black bg-violet-500 text-white rounded"
        >
          Connect Stripe
        </a>

        <h1 className='bg-black p-5'>{user.id}</h1>

        <a href={googleSearchAuthUrl} className='bg-amber-500 border-4 border-black p-4 rounded'>
          Connect to Search Console
        </a>
        
        <a
  href={googleAuthUrl}
>
  Connect Google Analytics
</a>

<h1>joe</h1>

        <a className='bg-amber-700 border-4 border-black p-4 rounded' href="">Connect to Reddit</a>
        <a className='bg-blue-500 border-4 border-black p-4 rounded' href="">Connect to Linkedin</a>
        <a className='bg-black p-4 border-4 border-black rounded text-white' href="">Connect to X</a>
        <a className='bg-green-500 border-4 border-black p-4 rounded' href="">Connect to Mail</a>
      </div>
    </div>
  )
}