<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/34633151-b1e6-4cb3-affd-2af72a8f0892

## Run Locally

**Prerequisites:** Node.js and MySQL

1. Install frontend dependencies:
   `npm install`
2. Install backend dependencies:
   `cd backend && npm install`
3. Configure MySQL in [backend/.env](backend/.env)
4. Seed the database:
   `cd backend && node seed.js`
5. Start the backend:
   `cd backend && npm run dev`
6. Start the frontend:
   `cd .. && npm run dev`

For detailed MySQL instructions, see [backend/MYSQL_SETUP.md](backend/MYSQL_SETUP.md).
