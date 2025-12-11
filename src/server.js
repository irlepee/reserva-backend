const app = require('./app');
require('dotenv').config({ path: '../.env' });
const { initializeCronJobs } = require('./services/cronJobs');

const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log('Server running on port ' + PORT);
    
    // Inicializar cron jobs
    initializeCronJobs();
})