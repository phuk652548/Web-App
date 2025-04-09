const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const SECRET_KEY = 'your-secret-key'; // กำหนด secret key สำหรับการสร้าง token

// การเชื่อมต่อฐานข้อมูล MySQL
const connection = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: 'root',
  database: 'my_database',
  port: 3306
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database: ' + err.stack);
    return;
  }
  console.log('Connected to the database with ID: ' + connection.threadId);
});

// ใช้ cors middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ตั้งค่า body-parser
app.use(bodyParser.json());

// API สำหรับการสมัครสมาชิก
app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  // ตรวจสอบว่า username มีอยู่ในฐานข้อมูลหรือไม่
  const checkQuery = 'SELECT * FROM users WHERE username = ?';
  connection.query(checkQuery, [username], async (err, results) => {
    if (err) {
      console.error('Error checking username:', err);
      return res.status(500).json({ message: 'Error during registration' });
    }

    if (results.length > 0) {
      return res.status(409).json({ message: 'Username already exists' });
    }

    // เข้ารหัสรหัสผ่านก่อนบันทึก
    const hashedPassword = await bcrypt.hash(password, 10);

    // บันทึกข้อมูลผู้ใช้ใหม่
    const query = 'INSERT INTO users (username, password) VALUES (?, ?)';
    connection.query(query, [username, hashedPassword], (err, results) => {
      if (err) {
        console.error('Error during registration:', err);
        return res.status(500).json({ message: 'Error during registration' });
      }
      res.status(200).json({ message: 'User registered successfully' });
    });
  });
});

// API สำหรับการล็อกอิน
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const query = 'SELECT * FROM users WHERE username = ?';
  
  connection.query(query, [username], async (err, results) => {
    if (err) {
      console.error('Error during login:', err);
      return res.status(500).json({ message: 'Error during login' });
    }

    if (results.length > 0) {
      const user = results[0];

      // เปรียบเทียบรหัสผ่านที่กรอกกับรหัสผ่านที่เข้ารหัสในฐานข้อมูล
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (passwordMatch) {
        // สร้าง JWT token เมื่อการล็อกอินสำเร็จ
        const token = jwt.sign({username: user.username}, SECRET_KEY, { expiresIn: '1h' });
        console.log(token)
        res.status(200).json({
          message: 'Login successful',
          token: token,
          username: user.username
        });
      } else {
        res.status(401).json({ message: 'Invalid username or password' });
      }
    } else {
      res.status(401).json({ message: 'Invalid username or password' });
    }
  });
});


app.get('/check-login', authenticateToken, (req, res) => {
  res.status(200).json({
    message: 'User is logged in',
    user: req.user
  });
});

// Middleware สำหรับตรวจสอบ JWT token
function authenticateToken(req, res, next) {
  const token = req.header('Authorization')?.split(' ')[1]; // ดึง token จาก Authorization header

  if (!token) {
    return res.status(401).json({ message: 'Token missing' });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token is invalid or expired' });
    }

    req.user = user; //  พิ่มข้อมูลผู้ใช้ที่ตรวจสอบแล้วลงใน req
    next(); // เรียกต่อไปยัง route handler
  });
}

// เพิ่ม API สำหรับตรวจสอบสถานะการล็อกอิน
app.get('/api/check-login', authenticateToken, (req, res) => {
  res.status(200).json({
    message: 'User is logged in',
    user: req.user // ส่งข้อมูลผู้ใช้ที่ตรวจสอบแล้ว
  });
});
// เริ่มเซิร์ฟเวอร์
const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
