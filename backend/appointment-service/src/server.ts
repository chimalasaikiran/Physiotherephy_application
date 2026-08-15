import app from './app.js';

const PORT = process.env.PORT || 5002;

app.listen(PORT, () => {
  console.log(`🚀 Appointment Service running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
});
