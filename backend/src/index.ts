import 'dotenv/config';
import { Env } from './config/env.config';
import connectDB from './config/db.config';
import { server } from './socket/index.socket';

const startServer = async () => {
  try {
    await connectDB();
    server.listen(Env.PORT, () => {
      console.log(
        `Server running on http://localhost:${Env.PORT} in ${Env.NODE_ENV}`
      );
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
