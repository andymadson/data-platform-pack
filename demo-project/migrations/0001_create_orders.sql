-- Migration 0001. Immutable once committed.
-- The data-platform-pack plugin blocks edits to this directory.
CREATE TABLE IF NOT EXISTS orders (
    order_id     INTEGER PRIMARY KEY,
    customer_id  TEXT,
    order_ts     TEXT NOT NULL,
    status       TEXT NOT NULL,
    amount_usd   REAL NOT NULL
);
