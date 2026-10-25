/**
 * tools/health-check.ts — Quick health check for all backend services.
 *
 * Run: npx ts-node tools/health-check.ts
 */
import http from 'http';

const API_URL = process.env.API_URL || 'http://localhost:3000';

function checkHttp(url: string): Promise<{ ok: boolean; status: number; body: string }> {
  return new Promise((resolve) => {
    http
      .get(url, (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () =>
          resolve({ ok: (res.statusCode ?? 0) < 400, status: res.statusCode ?? 0, body })
        );
      })
      .on('error', () => resolve({ ok: false, status: 0, body: 'Connection refused' }));
  });
}

async function main() {
  console.log('\n🔍 HRMS Backend Health Check\n');

  const checks = [
    { name: 'API Health', url: `${API_URL}/health` },
  ];

  let allOk = true;
  for (const check of checks) {
    const result = await checkHttp(check.url);
    const icon = result.ok ? '✅' : '❌';
    console.log(`${icon}  ${check.name} (${check.url}) → HTTP ${result.status}`);
    if (!result.ok) {
      allOk = false;
      console.log(`    Response: ${result.body.slice(0, 200)}`);
    }
  }

  console.log(allOk ? '\n✅ All checks passed\n' : '\n❌ Some checks failed\n');
  process.exit(allOk ? 0 : 1);
}

main().catch(console.error);
