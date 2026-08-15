import app from './app.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`🚀 User Service Microservice running on port ${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/v1/health`);
  console.log(`==================================================`);
});
