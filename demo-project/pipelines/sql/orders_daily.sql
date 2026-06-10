-- orders_daily: daily revenue rollup consumed by the finance dashboard.
-- NOTE: this model has review findings seeded on purpose for the demo.
DROP TABLE IF EXISTS orders_daily;
CREATE TABLE orders_daily AS
SELECT
    substr(order_ts, 1, 10) AS day,
    count(*) AS orders,
    sum(amount_usd) AS revenue
FROM (
    SELECT * FROM orders
)
GROUP BY 1;
