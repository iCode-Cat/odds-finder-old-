const epxress = require('express');
const app = epxress();
const cors = require('cors');
const stats = require('./routes/api/stats');

// Settings
app.use(epxress.json(), cors());
const PORT = process.env.PORT || 8080;

// Api
app.use('/api/stats', stats);

// Server
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
