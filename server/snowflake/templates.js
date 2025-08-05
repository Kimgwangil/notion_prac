// 미리 정의된 Snowflake 쿼리 템플릿들

const queryTemplates = {
  // 매출 대시보드
  salesDashboard: {
    query: `
      WITH monthly_sales AS (
        SELECT 
          DATE_TRUNC('month', CURRENT_DATE()) - INTERVAL '5 month' + (ROW_NUMBER() OVER (ORDER BY 1) - 1) * INTERVAL '1 month' as month,
          ROUND(RANDOM() * 10000000 + 5000000, 0) as total_sales,
          ROUND(RANDOM() * 1000 + 500, 0) as order_count,
          ROUND(RANDOM() * 50000 + 50000, 0) as avg_order_value
        FROM TABLE(GENERATOR(ROWCOUNT => 6))
      )
      SELECT 
        TO_VARCHAR(month, 'YYYY-MM') as month,
        total_sales,
        order_count,
        avg_order_value
      FROM monthly_sales
      ORDER BY month DESC
    `,
    description: '최근 6개월 매출 요약'
  },

  // 제품 성과
  productPerformance: {
    query: `
      WITH products AS (
        SELECT 
          CASE ROW_NUMBER() OVER (ORDER BY 1)
            WHEN 1 THEN 'iPhone 15'
            WHEN 2 THEN 'Galaxy S24'
            WHEN 3 THEN 'MacBook Pro'
            WHEN 4 THEN 'iPad Air'
            WHEN 5 THEN 'AirPods Pro'
            WHEN 6 THEN 'Watch Series 9'
            WHEN 7 THEN 'Surface Laptop'
            WHEN 8 THEN 'Dell XPS 13'
            WHEN 9 THEN 'Pixel 8'
            WHEN 10 THEN 'Steam Deck'
          END as product_name,
          ROUND(RANDOM() * 1000 + 100, 0) as units_sold,
          ROUND(RANDOM() * 5000000 + 1000000, 0) as revenue,
          ROUND(RANDOM() * 500 + 200, 0) as avg_price
        FROM TABLE(GENERATOR(ROWCOUNT => 10))
      )
      SELECT 
        product_name,
        units_sold,
        revenue,
        avg_price
      FROM products
      ORDER BY revenue DESC
    `,
    description: '제품별 판매 성과 (지난 30일)'
  },

  // 지역별 매출
  salesByRegion: {
    query: `
      WITH regions AS (
        SELECT 
          CASE ROW_NUMBER() OVER (ORDER BY 1)
            WHEN 1 THEN '서울'
            WHEN 2 THEN '부산'
            WHEN 3 THEN '대구'
            WHEN 4 THEN '인천'
            WHEN 5 THEN '광주'
            WHEN 6 THEN '대전'
            WHEN 7 THEN '울산'
            WHEN 8 THEN '경기'
          END as region,
          ROUND(RANDOM() * 8000000 + 2000000, 0) as total_sales,
          ROUND(RANDOM() * 500 + 100, 0) as unique_customers,
          ROUND(RANDOM() * 80000 + 40000, 0) as avg_order_value
        FROM TABLE(GENERATOR(ROWCOUNT => 8))
      )
      SELECT 
        region,
        total_sales,
        unique_customers,
        avg_order_value
      FROM regions
      ORDER BY total_sales DESC
    `,
    description: '지역별 매출 현황 (지난 90일)'
  },

  // 고객 분석
  customerAnalysis: {
    query: `
      WITH customer_segments AS (
        SELECT 
          CASE ROW_NUMBER() OVER (ORDER BY 1)
            WHEN 1 THEN 'VIP'
            WHEN 2 THEN '우수고객'
            WHEN 3 THEN '일반고객'
            WHEN 4 THEN '신규고객'
            WHEN 5 THEN '휴면고객'
          END as customer_segment,
          ROUND(RANDOM() * 1000 + 200, 0) as customer_count,
          ROUND(RANDOM() * 50000000 + 10000000, 0) as total_ltv,
          ROUND(RANDOM() * 200000 + 50000, 0) as avg_ltv
        FROM TABLE(GENERATOR(ROWCOUNT => 5))
      )
      SELECT 
        customer_segment,
        customer_count,
        total_ltv,
        avg_ltv
      FROM customer_segments
      ORDER BY total_ltv DESC
    `,
    description: '고객 세그먼트별 생애가치 분석'
  },

  // 실시간 매출 현황
  realTimeSales: {
    query: `
      WITH hourly_sales AS (
        SELECT 
          DATEADD('hour', -ROW_NUMBER() OVER (ORDER BY 1), CURRENT_TIMESTAMP()) as hour,
          ROUND(RANDOM() * 500000 + 100000, 0) as sales_amount,
          ROUND(RANDOM() * 50 + 10, 0) as order_count
        FROM TABLE(GENERATOR(ROWCOUNT => 24))
      )
      SELECT 
        TO_VARCHAR(hour, 'YYYY-MM-DD HH24:00') as hour,
        sales_amount,
        order_count,
        ROUND(sales_amount / order_count, 0) as avg_order_value
      FROM hourly_sales
      ORDER BY hour DESC
      LIMIT 12
    `,
    description: '시간별 실시간 매출 현황 (최근 12시간)'
  },

  // 재고 현황
  inventoryStatus: {
    query: `
      WITH inventory AS (
        SELECT 
          CASE ROW_NUMBER() OVER (ORDER BY 1)
            WHEN 1 THEN 'iPhone 15 Pro'
            WHEN 2 THEN 'Galaxy S24 Ultra'
            WHEN 3 THEN 'MacBook Air M3'
            WHEN 4 THEN 'iPad Pro 12.9'
            WHEN 5 THEN 'AirPods Max'
            WHEN 6 THEN 'Apple Watch Ultra'
            WHEN 7 THEN 'Surface Pro 10'
            WHEN 8 THEN 'Dell XPS 15'
          END as product_name,
          ROUND(RANDOM() * 500 + 50, 0) as current_stock,
          ROUND(RANDOM() * 100 + 20, 0) as min_stock_level,
          ROUND(RANDOM() * 50 + 10, 0) as daily_usage,
          CASE 
            WHEN RANDOM() < 0.3 THEN '부족'
            WHEN RANDOM() < 0.7 THEN '적정'
            ELSE '충분'
          END as stock_status
        FROM TABLE(GENERATOR(ROWCOUNT => 8))
      )
      SELECT 
        product_name,
        current_stock,
        min_stock_level,
        daily_usage,
        ROUND(current_stock / daily_usage, 1) as days_remaining,
        stock_status
      FROM inventory
      ORDER BY days_remaining ASC
    `,
    description: '제품별 재고 현황 및 소진 예상일'
  }
};

module.exports = queryTemplates;