const express = require('express');
const fs = require('fs');
const cors = require('cors');

const app = express();
app.use(cors()); // CORS 허용 (express.json() 아래에 추가)
app.use(express.json());

let products = [];
let users = {};  // 사용자 점수 저장 (메모리)

// products.json 불러오기
fs.readFile('products.json', 'utf8', (err, data) => {
  if (err) {
    console.error('제품 정보 로딩 실패:', err);
  } else {
    products = JSON.parse(data);
    console.log('제품 정보 로딩 완료');
  }
});

// QR 코드 인증 → 점수 적립
app.post('/api/submit', (req, res) => {
  const { userId, qrCode } = req.body;
  if (!userId || !qrCode) {
    return res.status(400).json({ message: 'userId와 qrCode가 필요합니다.' });
  }

  const product = products.find(p => p.qrCode === qrCode);
  if (!product) {
    return res.status(404).json({ message: 'QR 코드가 유효하지 않습니다.' });
  }

  if (!users[userId]) {
    users[userId] = { point: 0, submissions: [] };
  }

  users[userId].submissions.push({ qrCode, timestamp: new Date() });
  users[userId].point += product.score;

  res.json({
    message: `인증 완료! +${product.score}점`,
    totalPoint: users[userId].point
  });
});

// 점수 조회
app.get('/api/points/:userId', (req, res) => {
  const user = users[req.params.userId];
  if (!user) {
    return res.json({ point: 0 });
  }
  res.json({ point: user.point });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ 서버 실행 중! http://localhost:${PORT}`);
});


