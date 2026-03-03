from sqlalchemy import create_engine
import os
from datetime import datetime, timedelta
from pathlib import Path

from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Single SQLite database for all app data.
SQLALCHEMY_DATABASE_URL = "sqlite:///./cleansight.db"

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def cleanup_old_user_history(days: int = 30, uploads_dir: str | Path | None = None) -> dict[str, int]:
    uploads_base = Path(uploads_dir) if uploads_dir else Path(__file__).resolve().parent / "static" / "uploads"
    cutoff = datetime.utcnow() - timedelta(days=days)

    deleted_rows = 0
    deleted_files = 0

    with engine.begin() as conn:
        old_rows = conn.execute(
            text("SELECT id, image_path FROM user_history WHERE timestamp < :cutoff"),
            {"cutoff": cutoff},
        ).fetchall()

        ids_to_delete: list[int] = []
        for row in old_rows:
            row_id = int(row[0])
            image_path = str(row[1] or "")
            ids_to_delete.append(row_id)

            # Stored value can be '/static/uploads/file.jpg'; only keep filename.
            filename = Path(image_path).name
            if not filename:
                continue
            full_path = uploads_base / filename
            if full_path.exists():
                try:
                    os.remove(full_path)
                    deleted_files += 1
                except OSError:
                    pass

        if ids_to_delete:
            placeholders = ", ".join(f":id_{idx}" for idx in range(len(ids_to_delete)))
            params = {f"id_{idx}": value for idx, value in enumerate(ids_to_delete)}
            conn.execute(text(f"DELETE FROM user_history WHERE id IN ({placeholders})"), params)
            deleted_rows = len(ids_to_delete)

    return {"deleted_rows": deleted_rows, "deleted_files": deleted_files}
