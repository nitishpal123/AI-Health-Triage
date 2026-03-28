require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

// Connect Database
connectDB();

const PORT = parseInt(process.env.PORT) || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`AI Triage Backend running on 0.0.0.0:${PORT}`);
});
