require('dotenv').config();
const express = require('express');
const cors = require('cors');

const documentRoutes = require('./routes/documentRoutes');
const translationRoutes = require('./routes/translationRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// '/api' 접두사를 붙여 라우트를 등록
app.use('/api', documentRoutes);
app.use('/api', translationRoutes);

const { PORT } = process.env;
const port = PORT || 3001;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
