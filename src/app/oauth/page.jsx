import Link from 'next/link'


export default function oauth() {
    
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
  <a className='bg-amber-400 border-4 border-black p-4 rounded' href="">Connect to Google Analytics</a>
  <a className='bg-amber-700 border-4 border-black p-4 rounded' href="">Connect to Reddit</a>
  <a className='bg-blue-500 border-4 border-black p-4 rounded' href="">Connect to Linkedin</a>
  <a className='bg-black p-4 border-4 border-black rounded' href="">Connect to X</a>
  <a className='bg-green-500 border-4 border-black p-4 rounded' href="">Connect to Mail</a>

  </div>
  </div>
    )
}
