#!/usr/bin/env python3
"""Orders pipeline runner for the demo project.

Usage:
    python3 pipelines/run.py load      --target dev
    python3 pipelines/run.py transform --target dev
    python3 pipelines/run.py check     --target dev
    python3 pipelines/run.py all       --target dev

Targets map to local SQLite files (warehouse/dev.db, warehouse/prod.db) so the
pipeline runs anywhere with a stock Python 3 install. The data-platform-pack
plugin blocks agents from running any command with --target prod. The script
itself does not enforce that rule; the plugin's PreToolUse hook does. That
separation is the point of the demo.

Standard library only. No installs required.
"""

import argparse
import csv
import sqlite3
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SAMPLE_CSV = ROOT / "sample_data" / "orders.csv"
MIGRATION = ROOT / "migrations" / "0001_create_orders.sql"
TRANSFORM_SQL = ROOT / "pipelines" / "sql" / "orders_daily.sql"
WAREHOUSE_DIR = ROOT / "warehouse"


def connect(target: str) -> sqlite3.Connection:
    WAREHOUSE_DIR.mkdir(exist_ok=True)
    return sqlite3.connect(WAREHOUSE_DIR / f"{target}.db")


def load(conn: sqlite3.Connection, reset: bool) -> None:
    if reset:
        conn.execute("DROP TABLE IF EXISTS orders")
    conn.executescript(MIGRATION.read_text())
    conn.execute("DELETE FROM orders")
    with open(SAMPLE_CSV, newline="") as f:
        rows = [
            (
                int(r["order_id"]),
                r["customer_id"] or None,
                r["order_ts"],
                r["status"],
                float(r["amount_usd"]),
            )
            for r in csv.DictReader(f)
        ]
    conn.executemany("INSERT INTO orders VALUES (?, ?, ?, ?, ?)", rows)
    conn.commit()
    print(f"load: {len(rows)} rows into orders")


def transform(conn: sqlite3.Connection) -> None:
    conn.executescript(TRANSFORM_SQL.read_text())
    conn.commit()
    n = conn.execute("SELECT count(*) FROM orders_daily").fetchone()[0]
    print(f"transform: orders_daily built with {n} rows")


def check(conn: sqlite3.Connection) -> int:
    failures = 0
    n = conn.execute("SELECT count(*) FROM orders_daily").fetchone()[0]
    if n == 0:
        print("check FAIL: orders_daily is empty")
        failures += 1
    else:
        print(f"check ok: orders_daily has {n} rows")
    # Extension point: the live demo asks Claude to add a NULL customer_id
    # assertion and a complete-orders-only revenue rule here and in the model.
    return failures


def main() -> int:
    parser = argparse.ArgumentParser(description="Orders pipeline runner")
    parser.add_argument("command", choices=["load", "transform", "check", "all"])
    parser.add_argument("--target", choices=["dev", "prod"], default="dev")
    parser.add_argument(
        "--reset", action="store_true", help="Drop and rebuild the orders table first"
    )
    args = parser.parse_args()

    conn = connect(args.target)
    print(f"target: {args.target} ({WAREHOUSE_DIR / (args.target + '.db')})")

    failures = 0
    if args.command in ("load", "all"):
        load(conn, args.reset)
    if args.command in ("transform", "all"):
        transform(conn)
    if args.command in ("check", "all"):
        failures = check(conn)
    conn.close()
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
