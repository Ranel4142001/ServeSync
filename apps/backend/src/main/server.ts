import 'dotenv/config';
import { buildApp } from './app';

const PORT = Number(process.env.PORT) || 3000;

async function main() {
  const { app, httpServer } = buildApp();
  try {
    await app.ready();
    httpServer.listen( PORT, '0.0.0.0', () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Routes Registered:`);
      console.log(app.printRoutes());
    });
    
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

main();