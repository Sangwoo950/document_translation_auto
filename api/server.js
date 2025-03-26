require('dotenv').config();
const express = require('express');
const cors = require('cors');

const documentRoutes = require('./routes/documentRoutes');
const translationRoutes = require('./routes/translationRoutes');

const app = express();
app.use(cors());
app.use(express.json());

<<<<<<< HEAD
// '/api' 접두사를 붙여 라우트를 등록
app.use('/api', documentRoutes);
app.use('/api', translationRoutes);
=======
// 라우트 등록: API 경로에 /api 프리픽스를 붙이면 Vercel 라우팅과 맞출 수 있음
app.use(documentRoutes);
app.use(translationRoutes);
>>>>>>> origin/main

const { PORT } = process.env;
const port = PORT || 3001;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
