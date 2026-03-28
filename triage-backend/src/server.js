require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

// Connect Database
connectDB();

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`AI Triage Backend running on port ${PORT}`);
});
