import app from './app.js';

const PORT = process.env.PORT || 5003;

app.listen(PORT, () => {
  console.log(`🚀 Payment Service running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
});
