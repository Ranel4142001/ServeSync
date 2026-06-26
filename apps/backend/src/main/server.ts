import 'dotenv/config';
import { buildApp } from './app';

const PORT = Number(process.env.PORT) || 3000;

async function main() {
  const app = buildApp();
  try {
    await app.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`Server running on http://localhost:${PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

main();