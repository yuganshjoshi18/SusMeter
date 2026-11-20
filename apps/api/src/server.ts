import { app } from './app';
import { config } from './config';

app.listen(config.port, () => {
  console.log(`[susmeter-api] listening on http://localhost:${config.port}`);
  console.log(`[susmeter-api] ML service: ${config.mlUrl}`);
});
