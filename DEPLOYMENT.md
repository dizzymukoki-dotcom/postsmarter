# PostSmarter Deployment Guide

## Vercel Deployment

This project is configured for seamless deployment on Vercel with full-stack support (Vite frontend + Node.js backend).

### Prerequisites

- Vercel account (free tier works)
- Git repository (GitHub, GitLab, or Bitbucket)
- Environment variables configured

### Environment Variables Required

Set these in Vercel Project Settings → Environment Variables:

```
DATABASE_URL=your_mysql_connection_string
JWT_SECRET=your_jwt_secret_key
VITE_APP_ID=your_manus_oauth_app_id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im
OWNER_OPEN_ID=your_owner_id
OWNER_NAME=Your Name
BUILT_IN_FORGE_API_URL=https://api.manus.im/forge
BUILT_IN_FORGE_API_KEY=your_forge_api_key
VITE_FRONTEND_FORGE_API_KEY=your_frontend_forge_key
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im/forge
VITE_ANALYTICS_ENDPOINT=your_analytics_endpoint
VITE_ANALYTICS_WEBSITE_ID=your_analytics_id
VITE_APP_TITLE=PostSmarter
VITE_APP_LOGO=https://your-logo-url.png
```

### Deployment Steps

1. **Push to Git**
   ```bash
   git add .
   git commit -m "Add Vercel configuration"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to https://vercel.com/new
   - Import your Git repository
   - Select the project root directory
   - Vercel will auto-detect the build configuration

3. **Configure Build Settings**
   - Build Command: `pnpm build`
   - Output Directory: `dist`
   - Install Command: `pnpm install`

4. **Add Environment Variables**
   - In Vercel dashboard: Settings → Environment Variables
   - Paste all the variables from the list above

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (~2-3 minutes)
   - Your app will be live at `https://your-project.vercel.app`

### How It Works

The `vercel.json` configuration:

- **Routes API requests** (`/api/*`) to the Node.js backend server
- **Serves static files** from the Vite build output
- **Handles SPA routing** by redirecting all non-API routes to `index.html`
- **Sets proper cache headers** for optimal performance
- **Excludes unnecessary files** via `.vercelignore`

### Troubleshooting

**404 Error on Routes:**
- Ensure `vercel.json` is in the project root
- Check that `outputDirectory` matches your build output (`dist`)

**API Endpoints Not Working:**
- Verify all environment variables are set
- Check that `DATABASE_URL` is accessible from Vercel
- Review server logs in Vercel dashboard

**Build Fails:**
- Ensure `pnpm` is available (Vercel supports it by default)
- Check that all dependencies are in `package.json`
- Review build logs for TypeScript errors

### Local Testing

Before deploying, test the production build locally:

```bash
# Build the project
pnpm build

# Start the production server
pnpm start
```

Then visit `http://localhost:3000` to verify everything works.

### Custom Domain

1. In Vercel dashboard: Settings → Domains
2. Add your custom domain
3. Update DNS records according to Vercel's instructions
4. SSL certificate is auto-provisioned

### Rollback

To rollback to a previous deployment:
1. Go to Vercel dashboard → Deployments
2. Find the deployment you want to restore
3. Click the three dots → "Promote to Production"

### Support

For Vercel-specific issues, check:
- https://vercel.com/docs
- https://vercel.com/support
