require('dotenv').config();
const express = require('express');
const cors = require('cors');

const documentRoutes = require('./routes/documentRoutes');
const translationRoutes = require('./routes/translationRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// 라우트 등록: API 경로에 /api 프리픽스를 붙이면 Vercel 라우팅과 맞출 수 있음
app.use('/api', documentRoutes);
app.use('/api', translationRoutes);

// 환경 변수에서 PORT를 참조하고, 값이 없으면 3001로 기본 설정
const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
