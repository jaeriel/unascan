
CREATE TABLE scan_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  image_key TEXT NOT NULL,
  disease_detected TEXT,
  confidence_score REAL,
  recommendations TEXT,
  scan_location TEXT,
  user_notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_scan_results_created_at ON scan_results(created_at);
CREATE INDEX idx_scan_results_disease ON scan_results(disease_detected);
