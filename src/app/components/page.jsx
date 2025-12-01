  // App.jsx
  // import "./fonts.css";
  'use client'; // Add this at the very top of the file
  import { useState, useEffect } from 'react';
  import intergrations from "../../../public/integrations.png";
  import logo from '../../../public/logo.svg';
  import Image from 'next/image';
  import { FiSun, FiMoon } from 'react-icons/fi'; // You'll need to install react-icons
  import { useRouter } from 'next/navigation';


  export default function App() {
      const router = useRouter();
    
    return (
      <div style={{ fontFamily: "var(--font-story-script)" }} className="min-h-screen bg-[#f8f8f8] text-gray-900 font-sans">
        <nav className="w-full bg-white border-b border-gray-700 border-2  fixed top-0 left-0 z-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6  lg:px-8">
      <div className="flex justify-between h-16">
        {/* Logo */}
        <div className="flex items-center">
          <Image width={30} height={30} src={logo}/><span className="text-xl font-bold text-gray-900"> ManageYourSaaS</span>
        </div>

        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <a href="#features" className="text-xl xl:text-1xl lg:text-2xl text-gray-600 hover:text-gray-900 transition-colors">Features</a>
          <a href="#pricing" className="text-xl xl:text-1xl lg:text-2xl text-gray-600 hover:text-gray-900 transition-colors">Pricing</a>
          <a href="#about" className="text-xl xl:text-1xl lg:text-2xl text-gray-600 hover:text-gray-900 transition-colors">About</a>
        </div>
        
        {/* Auth Buttons */}
        <div className="flex items-center space-x-4">
          <a 
            href="https://discord.gg/3nTT9HnjJR" 
            className="text-lg border-2 bg-violet-400 font-bold lg:text-1xl xl:text-2xl text-black border-black hover:text-gray-900 px-3 py-2 rounded-md"
          >
            Discord
          </a>
          <button 
    onClick={() => router.push('/joinhere')}
    className="text-lg lg:text-1xl xl:text-2xl p-3 bg-black text-white rounded font-bold hover:opacity-90 transition"
  >
    Get Started
  </button>
        </div>
      </div>
    </div>
  </nav>

  <main className="mb-20"></main>


        <div className=" max-w-6xl mx-auto px-6 py-12 lg:py-20">
          
          {/* TOP SECTION - Centered Headline and CTAs */}
          <div className="text-center mb-16">
            <h1  className="text-5xl lg:text-7xl xl:text-8xl font-bold text-gray-900 mb-4 leading-tight">
              <span className="text-black">"One dashboard"  to manage</span>
              <br />
              <span className="text-gray-800"> your <span className="font-bold">entire SaaS !</span></span>
            </h1>
            
            <p className="text-1xl lg:text-2xl xl:text-3xl text-gray-700 max-w-3xl mx-auto mb-8">
              Stop switching between <span className="font-bold text-orange-600">Reddit</span>, <span className="font-bold text-blue-700">LinkedIn</span>, <span className="font-bold text-black">X</span>, <span className="font-bold text-amber-800">Google Analytics</span>, <span className="font-bold text-yellow-600">Search Console</span>, and <span className="font-bold text-violet-700">Stripe</span> just to understand your own business. <span className="font-bold"> <br /> Get everything you need — social reach, SEO, traffic, signups, and revenue — in one simple place.</span>
            </p>
            {/* CTA Buttons - Centered */}
            <div className="flex items-center justify-center gap-4 mb-3">
              <button 
    onClick={() => router.push('/joinhere')}
    className="text-lg lg:text-1xl xl:text-2xl p-3 bg-black text-white rounded font-bold hover:opacity-90 transition"
  >
    Get started
  </button>
              <button className="text-lg lg:text-1xl xl:text-2xl p-3 bg-gray-800 text-white rounded font-bold hover:opacity-90 transition">
                Contact us 
              </button>
              
            
            </div>
          </div>
            <hr className="opacity-25"/>
            <br />
          {/* MIDDLE SECTION - Dashboard Visualization */}
          
          <div className="flex flex-col gap-6 justify-between items-center">

              <div className="font-bold text-2xl lg:text-3xl xl:text-4xl">
                  <h1>🌟All scattered apps in one place🌟</h1>
              </div>

              <div>
                  <Image  className=" border-4 p-2 rounded-lg border-black" src={intergrations}/>
              </div>
          </div>


          {/* BOTTOM SECTION - Features */}
          <div className="mt-20">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 text-center mb-12">
              Everything You Need to Grow — In One Place
            </h2>
            
            {/* Features Grid - 2x2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              
              {/* Feature 1 - Social Media */}
              <div className="p-6 bg-white border border-gray-300 rounded-lg">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className=" text-1xl lg:text-2xl xl:text-3xl font-semibold text-gray-900 mb-2">Social Media</h3>
                    <p className="text-gray-600 text-sm">
                      Post, schedule, a track Reddit & Linkedin from one dashboard.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Feature 2 - Ads Overview */}
              <div className="p-6 bg-white border border-gray-300 rounded-lg">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-1xl lg:text-2xl xl:text-3xl text-gray-900 mb-2">Ads Overview</h3>
                    <p className="text-gray-600 text-sm">
                      See all your ad performance— spend, clicks, conversions.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Feature 3 - SEO Insights */}
              <div className="p-6 bg-white border border-gray-300 rounded-lg">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold  text-1xl lg:text-2xl xl:text-3xl text-gray-900 mb-2">SEO Insights</h3>
                    <p className="text-gray-600 text-sm">
                      Monitor keywords, rankings, impressions, and search tren
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Feature 4 - User Analytics */}
              <div className="p-6 bg-white border border-gray-300 rounded-lg">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold  text-1xl lg:text-2xl xl:text-3xl text-gray-900 mb-2">User Analytics</h3>
                    <p className="text-gray-600 text-sm">
                      Track DAU, signups. funels, and retention with instant clarity.
                    </p>
                  </div>
                </div>
              </div>
              
            </div>
          </div>

          {/* Contact Section */}
  <footer className="mt-24 py-12 bg-gray-50">
    <div className="max-w-4xl mx-auto text-center">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Get In Touch</h2>
      <p className="text-lg lg:text-2xl xl:text-3xl text-gray-600 mb-6">
        Have questions or want to learn more? We'd love to hear from you!
      </p>
      <div className="flex border-2 border-black items-center justify-center gap-2">
        <span className="text-lg  lg:text-1xl xl:text-2xl font-medium">Email:</span>
        <a 
          href="mailto:manageyoursaas@gmail.com" 
          className="text-lg lg:text-1xl xl:text-2xl text-blue-600 hover:underline"
        >
          manageyoursaas@gmail.com
        </a>
      </div>
      <div className="mt-8 pt-8 border-t border-gray-200">
        <p className="text-gray-500">
          &copy; {new Date().getFullYear()} ManageYourSaaS. All rights reserved.
        </p>
      </div>
    </div>
  </footer>

        </div>
      </div>
    );
  }