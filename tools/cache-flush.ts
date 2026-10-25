/**
 * tools/cache-flush.ts — Flush Redis cache keys by pattern.
 *
 * Usage:
 *   npx ts-node tools/cache-flush.ts              # flush ALL keys (careful!)
 *   npx ts-node tools/cache-flush.ts rbac:*       # flush RBAC cache only
 *   npx ts-node tools/cache-flush.ts employees:*  # flush employee cache
 *   npx ts-node tools/cache-flush.ts "tenant123:*" # flush one tenant
 */
import 'dotenv/config';
import Redis from 'ioredis';

const pattern = process.argv[2] || '*';

async function main() {
  const client = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    lazyConnect: true,
  });

  await client.connect();
  console.log(`\n🔥 Flushing keys matching: "${pattern}"\n`);

  let cursor = '0';
  let total = 0;

  do {
    const [nextCursor, keys] = await client.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
    cursor = nextCursor;

    if (keys.length > 0) {
      await client.del(...keys);
      total += keys.length;
      console.log(`  Deleted ${keys.length} keys: ${keys.slice(0, 3).join(', ')}${keys.length > 3 ? '...' : ''}`);
    }
  } while (cursor !== '0');

  console.log(`\n✅ Done — deleted ${total} key(s)\n`);
  await client.quit();
}

main().catch((err) => {
  console.error('❌', err.message);
  process.exit(1);
});
