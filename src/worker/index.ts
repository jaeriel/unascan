import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { CreateScanRequestSchema } from "@/shared/types";

const app = new Hono<{ Bindings: Env }>();

// Upload scan endpoint
app.post("/api/upload-scan", async (c) => {
  try {
    const formData = await c.req.formData();
    const imageFile = formData.get("image") as File;
    
    if (!imageFile) {
      return c.json({ error: "No image file provided" }, 400);
    }

    // Generate unique key for the image
    const timestamp = Date.now();
    const key = `scans/${timestamp}-${imageFile.name}`;

    // Upload to R2
    await c.env.R2_BUCKET.put(key, imageFile, {
      httpMetadata: {
        contentType: imageFile.type,
      },
    });

    // Save scan record to database (placeholder - would normally include AI analysis results)
    const result = await c.env.DB.prepare(`
      INSERT INTO scan_results (image_key, disease_detected, confidence_score, recommendations, created_at, updated_at)
      VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
    `).bind(
      key,
      'pending_analysis',
      null,
      'Analysis in progress...'
    ).run();

    return c.json({ 
      success: true, 
      scanId: result.meta.last_row_id,
      imageKey: key 
    });
  } catch (error) {
    console.error("Upload error:", error);
    return c.json({ error: "Failed to upload scan" }, 500);
  }
});

// Get scan history
app.get("/api/scans", async (c) => {
  try {
    const result = await c.env.DB.prepare(`
      SELECT * FROM scan_results 
      ORDER BY created_at DESC 
      LIMIT 50
    `).first();

    // If result is null, return empty array
    return c.json({ scans: result ? [result] : [] });
  } catch (error) {
    console.error("Database error:", error);
    return c.json({ error: "Failed to fetch scans" }, 500);
  }
});

// Get specific scan
app.get("/api/scans/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const result = await c.env.DB.prepare(`
      SELECT * FROM scan_results WHERE id = ?
    `).bind(id).first();

    if (!result) {
      return c.json({ error: "Scan not found" }, 404);
    }

    return c.json({ scan: result });
  } catch (error) {
    console.error("Database error:", error);
    return c.json({ error: "Failed to fetch scan" }, 500);
  }
});

// Get scan image
app.get("/api/images/:key", async (c) => {
  try {
    const key = c.req.param("key");
    const object = await c.env.R2_BUCKET.get(`scans/${key}`);
    
    if (!object) {
      return c.json({ error: "Image not found" }, 404);
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("etag", object.httpEtag);
    
    return c.body(object.body, { headers });
  } catch (error) {
    console.error("R2 error:", error);
    return c.json({ error: "Failed to fetch image" }, 500);
  }
});

// Update scan with analysis results
app.put("/api/scans/:id", zValidator("json", CreateScanRequestSchema), async (c) => {
  try {
    const id = c.req.param("id");
    const data = c.req.valid("json");

    const result = await c.env.DB.prepare(`
      UPDATE scan_results 
      SET disease_detected = ?, confidence_score = ?, recommendations = ?, 
          scan_location = ?, user_notes = ?, updated_at = datetime('now')
      WHERE id = ?
    `).bind(
      data.disease_detected || null,
      data.confidence_score || null,
      data.recommendations || null,
      data.scan_location || null,
      data.user_notes || null,
      id
    ).run();

    if (!result.success) {
      return c.json({ error: "Failed to update scan" }, 500);
    }

    return c.json({ success: true });
  } catch (error) {
    console.error("Database error:", error);
    return c.json({ error: "Failed to update scan" }, 500);
  }
});

// Health check
app.get("/api/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

export default app;
