const express = require('express');
const router = express.Router();
const snowflakeConnection = require('../snowflake/connection');
const queryTemplates = require('../snowflake/templates');

// 연결 상태 확인
router.get('/status', async (req, res) => {
  try {
    const isConnected = snowflakeConnection.isConnectionAlive();
    res.json({
      success: true,
      connected: isConnected,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 직접 쿼리 실행
router.post('/query', async (req, res) => {
  try {
    const { query, parameters = {} } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'SQL 쿼리가 필요합니다.'
      });
    }

    console.log('쿼리 요청 받음:', { query, parameters });

    const result = await snowflakeConnection.executeQuery(query, parameters);

    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('쿼리 실행 오류:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// 템플릿 쿼리 실행
router.post('/template/:templateName', async (req, res) => {
  try {
    const { templateName } = req.params;
    const { parameters = {} } = req.body;

    const template = queryTemplates[templateName];
    if (!template) {
      return res.status(404).json({
        success: false,
        error: `템플릿 '${templateName}'을 찾을 수 없습니다.`,
        availableTemplates: Object.keys(queryTemplates)
      });
    }

    console.log(`템플릿 쿼리 실행: ${templateName}`);
    console.log('설명:', template.description);

    const result = await snowflakeConnection.executeQuery(template.query, parameters);

    res.json({
      success: true,
      templateName,
      description: template.description,
      data: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('템플릿 쿼리 실행 오류:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      templateName: req.params.templateName,
      timestamp: new Date().toISOString()
    });
  }
});

// 사용 가능한 템플릿 목록
router.get('/templates', (req, res) => {
  try {
    const templates = Object.keys(queryTemplates).map(key => ({
      name: key,
      description: queryTemplates[key].description
    }));

    res.json({
      success: true,
      templates,
      count: templates.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 연결 테스트
router.post('/test-connection', async (req, res) => {
  try {
    console.log('Snowflake 연결 테스트 시작...');
    
    // 간단한 테스트 쿼리
    const testQuery = 'SELECT CURRENT_TIMESTAMP() as current_time, CURRENT_USER() as current_user';
    const result = await snowflakeConnection.executeQuery(testQuery);

    res.json({
      success: true,
      message: 'Snowflake 연결 성공!',
      testResult: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('연결 테스트 실패:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Snowflake 연결 실패',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;