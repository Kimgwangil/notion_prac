// Snowflake 데이터 연결을 위한 API 유틸리티

export class SnowflakeAPI {
  constructor(config = {}) {
    this.baseURL = config.baseURL || "http://localhost:3001/api/snowflake";
    this.timeout = config.timeout || 30000;
  }

  // 쿼리 실행
  async executeQuery(query, parameters = {}) {
    try {
      const response = await fetch(`${this.baseURL}/query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          parameters,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Snowflake query error:", error);
      throw error;
    }
  }

  // 서버의 템플릿 쿼리 사용
  async getTemplateData(templateName, params = {}) {
    try {
      const response = await fetch(`${this.baseURL}/template/${templateName}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          parameters: params,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Template query failed");
      }

      return result.data;
    } catch (error) {
      console.error("Template query error:", error);
      throw error;
    }
  }

  // 데이터를 테이블 형태로 포맷팅
  formatAsTable(data) {
    if (!data || !data.rows || data.rows.length === 0) {
      return null;
    }

    return {
      headers: data.columns || Object.keys(data.rows[0]),
      rows: data.rows.map((row) => Object.values(row)),
    };
  }

  // 데이터를 Callout용 요약으로 포맷팅
  formatAsCalloutSummary(data, type = "info") {
    if (!data || !data.rows || data.rows.length === 0) {
      return {
        type,
        title: "데이터 없음",
        content: "조회된 데이터가 없습니다.",
      };
    }

    const firstRow = data.rows[0];
    const keys = Object.keys(firstRow);

    let title = "데이터 요약";
    let content = "";

    // 데이터 타입에 따라 요약 생성
    if (keys.includes("total_sales") || keys.includes("revenue")) {
      title = "📊 매출 요약";
      content = `총 매출: ${this.formatCurrency(firstRow.total_sales || firstRow.revenue)}`;
      if (firstRow.order_count) content += `\n주문 수: ${firstRow.order_count.toLocaleString()}`;
      if (firstRow.avg_order_value) content += `\n평균 주문액: ${this.formatCurrency(firstRow.avg_order_value)}`;
    } else if (keys.includes("customer_count")) {
      title = "👥 고객 분석";
      content = `총 고객 수: ${firstRow.customer_count.toLocaleString()}`;
      if (firstRow.total_ltv) content += `\n총 생애가치: ${this.formatCurrency(firstRow.total_ltv)}`;
    } else {
      content = Object.entries(firstRow)
        .slice(0, 3)
        .map(([key, value]) => `${key}: ${value}`)
        .join("\n");
    }

    return {
      type,
      title,
      content,
    };
  }

  // 통화 포맷팅
  formatCurrency(amount) {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
    }).format(amount);
  }
}

// 싱글톤 인스턴스
export const snowflakeAPI = new SnowflakeAPI();
