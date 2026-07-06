#!/bin/sh
set -e

echo "Waiting for MySQL to be ready..."
until npx tsx -e "const m=require('mysql2/promise');m.createConnection({host:process.env.DB_HOST,port:3306,user:process.env.DB_USER,password:process.env.DB_PASSWORD}).then(c=>{console.log('MySQL ready');c.end()}).catch(()=>process.exit(1))" 2>/dev/null; do
  echo "MySQL not ready, retrying in 3s..."
  sleep 3
done

echo "Running database setup..."
npx tsx src/infrastructure/database/setup.ts

echo "Running seed..."
npx tsx src/infrastructure/database/seed.ts

echo "Starting API server..."
exec npx tsx src/index.ts
