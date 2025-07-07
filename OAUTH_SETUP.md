# OAuth Setup Instructions

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project or create a new one
3. Go to "APIs & Services" > "Credentials"
4. Click on your OAuth 2.0 Client ID
5. Add these Authorized redirect URIs:
   - `http://localhost:3001/api/auth/callback/google`
   - `http://localhost:3000/api/auth/callback/google` (if using port 3000)
   - `https://yourdomain.com/api/auth/callback/google` (for production)

## GitHub OAuth Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click on your OAuth App
3. Set the Authorization callback URL to:
   - `http://localhost:3001/api/auth/callback/github`
   - `https://yourdomain.com/api/auth/callback/github` (for production)

## Current Issue

The OAuth redirect URI mismatch error occurs because the redirect URIs in your OAuth app configuration don't match the ones NextAuth is trying to use.

## Temporary Development Solution

For development, you can use the demo user that's already configured:
- Email: `devyk100@gmail.com`
- This user is automatically used when no session is available
- All features work with this demo user

## Environment Variables

Make sure these are set in your `.env` file:
```
NEXTAUTH_URL="http://localhost:3001"
NEXTAUTH_SECRET="your-secure-random-string"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
