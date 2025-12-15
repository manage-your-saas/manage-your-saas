import Link from 'next/link'
// import { createClient } from "@supabase/supabase-js";
import { getUser } from "@/lib/getUser";

export default async function oauth() {

  const user = await getUser();

  if (!user) return <p>Please log in first.</p>;

  console.log(user);

    return(
      <div>
        <div className='text-3xl border-2 border-black flex flex-col gap-4 justify-center items-center p-4' style={{ fontFamily: "var(--font-story-script)" }}>    
            <a
  href={`https://connect.stripe.com/oauth/authorize?response_type=code&client_id=${process.env.STRIPE_CLIENT_ID}&scope=read_write`}
  className="px-4 py-2 border-4 border-black  bg-violet-500 text-white rounded"
>
  Connect Stripe
</a>

  <a className='bg-amber-500 border-4 border-black p-4 rounded' href="">Connect to Search Console</a>
  
<a
  href={`https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI)}&response_type=code&scope=https://www.googleapis.com/auth/analytics.readonly&access_type=offline&prompt=consent&state=${encodeURIComponent(JSON.stringify({ userId: user.id }))}`}
  className="btn"
>
  Connect Google Analytics
</a>

  <a className='bg-amber-700 border-4 border-black p-4 rounded' href="">Connect to Reddit</a>
  <a className='bg-blue-500 border-4 border-black p-4 rounded' href="">Connect to Linkedin</a>
  <a className='bg-black p-4 border-4 border-black rounded' href="">Connect to X</a>
  <a className='bg-green-500 border-4 border-black p-4 rounded' href="">Connect to Mail</a>

  </div>
  </div>
    )
}
