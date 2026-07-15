# MySQL setup for ELECTRA

## 1. Install MySQL
If you do not already have MySQL installed, install it and start the MySQL server.

## 2. Create the database
Open MySQL shell and run:

```sql
CREATE DATABASE IF NOT EXISTS electra_db;
```

## 3. Update backend environment
In [backend/.env](backend/.env), set the values for your local MySQL instance:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=electra_db
JWT_SECRET=electra-super-secret-key
```

## 4. Seed the database
From the project root run:

```bash
cd backend
node seed.js
```

This will:
- create the required tables
- add sample users
- add sample products
- add coupon codes

## 5. Login credentials
Use these seeded accounts:
- Seller: seller@electra.com / password123
- Buyer: buyer@electra.com / password123

## 6. Start the app
```bash
cd ..
npm run dev
cd backend
npm run dev
```
