# ManageYourSaaS

A comprehensive SaaS management dashboard that helps you monitor and optimize your subscription business with real-time analytics, revenue tracking, and customer insights.

## ✨ Features

### 🎯 Core Dashboard
- **Real-time Analytics**: Monitor live user activity and engagement metrics
- **Revenue Tracking**: Track MRR, ARR, and subscription growth
- **Customer Insights**: Analyze customer behavior and churn patterns
- **Multi-platform Integration**: Connect with Stripe, Google Analytics, and more

### 📊 Analytics Dashboard
- **Real-time Users**: Monitor active users with device breakdown
- **Traffic Sources**: Understand where your users come from
- **Geographic Data**: Visualize user distribution across regions
- **Performance Metrics**: Track page views, bounce rates, and session duration

### 💳 Stripe Integration
- **Revenue Metrics**: Real-time revenue and subscription data
- **Customer Analytics**: Customer growth and retention metrics
- **Transaction History**: Detailed invoice and payment tracking
- **Subscription Health**: Monitor churn and subscription lifecycle

### 🔍 SEO Tools
- **Google Search Console**: Track search performance and rankings
- **Keyword Analysis**: Monitor keyword positions and visibility
- **Site Performance**: Analyze organic traffic and click-through rates

### 🎨 Modern UI/UX
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Dark/Light Mode**: Toggle between themes
- **Interactive Charts**: Beautiful data visualizations with Chart.js
- **Smooth Animations**: Engaging micro-interactions and transitions

## 🛠 Tech Stack

### Frontend
- **Next.js 16**: React framework with App Router
- **React 19**: Modern React with latest features
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Radix UI**: Accessible component primitives
- **Lucide React**: Beautiful icon library
- **Chart.js & Recharts**: Data visualization libraries

### Backend & APIs
- **Supabase**: Authentication and database
- **Stripe API**: Payment processing and analytics
- **Google APIs**: Analytics and Search Console
- **Next.js API Routes**: Serverless backend

### Development Tools
- **ESLint**: Code linting and formatting
- **PostCSS**: CSS processing
- **TypeScript**: Static type checking

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, pnpm, or bun
- Supabase account
- Stripe account (for payment integration)
- Google Analytics & Search Console accounts

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/manageyoursaas.git
   cd manageyoursaas
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

4. **Configure environment variables**
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

   # Stripe Configuration
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PUBLISHABLE_KEY=pk_test_...

   # Google OAuth
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret

   # Next.js
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret
   ```

5. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
manageyoursaas/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   ├── stripe/        # Stripe integration
│   │   │   ├── google/        # Google Analytics & Search Console
│   │   │   └── ...
│   │   ├── dashboard/         # Dashboard pages
│   │   │   ├── analytics/     # Analytics dashboard
│   │   │   ├── stripe/        # Stripe dashboard
│   │   │   ├── seo/           # SEO tools
│   │   │   └── ...
│   │   ├── auth/              # Authentication pages
│   │   ├── pricing/           # Pricing page
│   │   └── page.jsx           # Landing page
│   ├── components/            # Reusable components
│   │   ├── ui/               # Base UI components
│   │   ├── dashboard/        # Dashboard-specific components
│   │   ├── hero-section.tsx  # Landing page hero
│   │   ├── features-section.tsx
│   │   ├── pricing-section.tsx
│   │   └── ...
│   └── lib/                   # Utility functions
├── public/                    # Static assets
├── components.json            # shadcn/ui configuration
└── tailwind.config.js         # Tailwind CSS configuration
```

## 🔧 Configuration

### Setting up Integrations

#### 1. Supabase
1. Create a new project at [supabase.com](https://supabase.com)
2. Run the provided SQL schema to create required tables
3. Copy your project URL and anon key to `.env.local`

#### 2. Stripe
1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Get your API keys from the Dashboard
3. Set up webhooks for real-time updates
4. Add keys to your environment variables

#### 3. Google Analytics & Search Console
1. Create a project at [Google Cloud Console](https://console.cloud.google.com)
2. Enable Analytics API and Search Console API
3. Create OAuth 2.0 credentials
4. Add your domain to the authorized origins

## 📊 Available Dashboards

### Main Dashboard
- Overview of all connected services
- Key metrics and KPIs
- Quick access to all features

### Analytics Dashboard
- Real-time user activity
- Traffic sources and mediums
- Device and geographic breakdown
- Page performance metrics

### Stripe Dashboard
- Revenue metrics (MRR, ARR)
- Customer analytics
- Subscription health
- Recent transactions
- Churn analysis

### SEO Dashboard
- Search performance
- Keyword rankings
- Click-through rates
- Site indexing status

## 🎨 Customization

### Theming
The application uses Tailwind CSS for styling. You can customize the theme by modifying:
- `tailwind.config.js` for design tokens
- `src/app/globals.css` for global styles
- Component-level styles for specific modifications

### Adding New Integrations
1. Create API routes in `src/app/api/`
2. Add dashboard components in `src/components/dashboard/`
3. Update the sidebar navigation in `src/app/dashboard/seo/dashboard-sidebar.tsx`

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push

### Other Platforms
The application can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- DigitalOcean App Platform
- Railway

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourusername/manageyoursaas/issues) page
2. Create a new issue with detailed information
3. Join our [Discord community](https://discord.gg/yourserver) (optional)

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework
- [Supabase](https://supabase.com/) - Backend as a Service
- [Stripe](https://stripe.com/) - Payment processing
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Radix UI](https://www.radix-ui.com/) - Component primitives
- [Lucide](https://lucide.dev/) - Icon library

---

**Built with ❤️ for the SaaS community**
