const snowflake = require("snowflake-sdk");
require("dotenv").config();

class SnowflakeConnection {
  constructor() {
    this.connection = null;
    this.isConnected = false;
  }

  // Snowflake 연결 생성
  async connect() {
    if (this.isConnected && this.connection) {
      return this.connection;
    }

    try {
      const connectionOptions = {
        account: process.env.SNOWFLAKE_ACCOUNT,
        username: process.env.SNOWFLAKE_USERNAME,
        password: process.env.SNOWFLAKE_PASSWORD,
        database: process.env.SNOWFLAKE_DATABASE,
        schema: process.env.SNOWFLAKE_SCHEMA,
        warehouse: process.env.SNOWFLAKE_WAREHOUSE,
        role: process.env.SNOWFLAKE_ROLE,
        // 추가 옵션들
        clientSessionKeepAlive: true,
        clientSessionKeepAliveHeartbeatFrequency: 3600,
        jsTreatIntegerAsBigInt: false,
      };

      console.log("Snowflake 연결 시도 중...", {
        account: connectionOptions.account,
        username: connectionOptions.username,
        database: connectionOptions.database,
      });

      this.connection = snowflake.createConnection(connectionOptions);

      // Promise로 연결
      await new Promise((resolve, reject) => {
        this.connection.connect((err, conn) => {
          if (err) {
            console.error("Snowflake 연결 실패:", err);
            reject(err);
          } else {
            console.log("Snowflake 연결 성공!");
            this.isConnected = true;
            resolve(conn);
          }
        });
      });

      return this.connection;
    } catch (error) {
      console.error("Snowflake 연결 오류:", error);
      throw error;
    }
  }

  // 쿼리 실행
  async executeQuery(sqlText, parameters = {}) {
    try {
      if (!this.isConnected) {
        await this.connect();
      }

      console.log("쿼리 실행:", sqlText);
      console.log("파라미터:", parameters);

      return new Promise((resolve, reject) => {
        // Snowflake SDK는 binds가 배열이어야 함. 파라미터가 없으면 속성 자체를 제거
        const executeOptions = {
          sqlText: sqlText,
          complete: (err, stmt, rows) => {
            if (err) {
              console.error("쿼리 실행 오류:", err);
              reject(err);
            } else {
              console.log(`쿼리 완료: ${rows.length}행 반환`);

              // 컬럼 정보 추출 (소문자로 변환)
              const columns = stmt.getColumns().map((col) => col.getName().toLowerCase());
              const originalColumns = stmt.getColumns().map((col) => col.getName());

              // 결과 데이터 포맷팅 (키를 소문자로 변환)
              const formattedRows = rows.map((row) => {
                const formattedRow = {};
                originalColumns.forEach((originalCol, index) => {
                  const lowerCol = originalCol.toLowerCase();
                  formattedRow[lowerCol] = row[originalCol];
                });
                return formattedRow;
              });

              resolve({
                columns: columns,
                rows: formattedRows,
                rowCount: rows.length,
              });
            }
          },
        };

        // 파라미터가 있고 배열이면 binds 추가
        if (Array.isArray(parameters) && parameters.length > 0) {
          executeOptions.binds = parameters;
        } else if (typeof parameters === "object" && parameters !== null) {
          const paramValues = Object.values(parameters);
          if (paramValues.length > 0) {
            executeOptions.binds = paramValues;
          }
        }

        this.connection.execute(executeOptions);
      });
    } catch (error) {
      console.error("executeQuery 오류:", error);
      throw error;
    }
  }

  // 연결 닫기
  async disconnect() {
    if (this.connection && this.isConnected) {
      try {
        await new Promise((resolve, reject) => {
          this.connection.destroy((err, conn) => {
            if (err) {
              reject(err);
            } else {
              this.isConnected = false;
              this.connection = null;
              console.log("Snowflake 연결 종료");
              resolve();
            }
          });
        });
      } catch (error) {
        console.error("연결 종료 오류:", error);
      }
    }
  }

  // 연결 상태 확인
  isConnectionAlive() {
    return this.isConnected && this.connection;
  }
}

// 싱글톤 인스턴스
const snowflakeConnection = new SnowflakeConnection();

module.exports = snowflakeConnection;
