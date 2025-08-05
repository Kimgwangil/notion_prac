const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const cors = require("cors");
require("dotenv").config();

// Express 앱 생성
const app = express();

// 미들웨어 설정
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));

// 로깅 미들웨어
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Snowflake API 라우터
const snowflakeRouter = require("./routes/snowflake");
app.use("/api/snowflake", snowflakeRouter);

// 기본 라우트
app.get("/", (req, res) => {
  res.json({
    message: "Mini Collab Editor Server",
    version: "1.0.0",
    endpoints: {
      websocket: "ws://localhost:3001",
      snowflake: "/api/snowflake/*",
    },
    timestamp: new Date().toISOString(),
  });
});

// 헬스체크
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

// HTTP 서버 생성
const server = http.createServer(app);

// WebSocket 서버 설정 (기존 Yjs 용)
const wss = new WebSocket.Server({ server });

// Store documents in memory
const docs = new Map();

wss.on("connection", (conn, req) => {
  console.log("WebSocket client connected");

  conn.on("message", (message) => {
    // Echo the message back for now (Yjs collaborative editing)
    conn.send(message);
  });

  conn.on("close", () => {
    console.log("WebSocket client disconnected");
  });
});

// 에러 핸들링
app.use((err, req, res, next) => {
  console.error("서버 오류:", err);
  res.status(500).json({
    success: false,
    error: "내부 서버 오류",
    timestamp: new Date().toISOString(),
  });
});

// 404 핸들링
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "경로를 찾을 수 없습니다",
    path: req.originalUrl,
    timestamp: new Date().toISOString(),
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 서버 실행 중:`);
  console.log(`   📡 HTTP API: http://localhost:${PORT}`);
  console.log(`   🔌 WebSocket: ws://localhost:${PORT}`);
  console.log(`   ❄️  Snowflake API: http://localhost:${PORT}/api/snowflake`);
  console.log(`   📊 헬스체크: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM 신호 받음, 서버 종료 중...");
  server.close(() => {
    console.log("서버 종료 완료");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("SIGINT 신호 받음, 서버 종료 중...");
  server.close(() => {
    console.log("서버 종료 완료");
    process.exit(0);
  });
});
