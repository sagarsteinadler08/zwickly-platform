# CORS Fix Instructions

## Problem
- Frontend (port 8080) can't access Next.js API (port 3000)
- All API calls failing with CORS errors
- Socket.IO not connecting

## Root Cause
The Next.js API routes need proper CORS handling for preflight requests.

## Quick Fix

Add this to EVERY API route file in `pages/api/**/`:

```typescript
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // CORS headers FIRST, before any other logic
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // ... rest of your handler logic
}
```

## OR - Global Fix (Recommended)

Create `next.config.js` in project root:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: 'http://localhost:8080' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

Then restart Next.js server.

## Test
After applying fix, check in browser console:
- Should NOT see CORS errors
- API calls should succeed
