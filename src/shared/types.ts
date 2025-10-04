import z from "zod";

export const ScanResultSchema = z.object({
  id: z.number(),
  image_key: z.string(),
  disease_detected: z.string().nullable(),
  confidence_score: z.number().nullable(),
  recommendations: z.string().nullable(),
  scan_location: z.string().nullable(),
  user_notes: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type ScanResult = z.infer<typeof ScanResultSchema>;

export const CreateScanRequestSchema = z.object({
  image_key: z.string(),
  disease_detected: z.string().optional(),
  confidence_score: z.number().optional(),
  recommendations: z.string().optional(),
  scan_location: z.string().optional(),
  user_notes: z.string().optional(),
});

export type CreateScanRequest = z.infer<typeof CreateScanRequestSchema>;

export const DiseaseInfo = {
  "red_rot": {
    name: "Red Rot",
    treatment: "Apply Bordeaux mixture (1%) or Copper oxychloride (0.3%). Remove infected stalks and burn them. Improve drainage and avoid waterlogging.",
    severity: "high"
  },
  "smut": {
    name: "Smut Disease",
    treatment: "Use resistant varieties. Apply systemic fungicides like Propiconazole. Remove and destroy infected plants immediately.",
    severity: "high"
  },
  "rust": {
    name: "Rust Disease",
    treatment: "Spray Mancozeb (0.25%) or Propiconazole (0.1%). Ensure proper spacing between plants for air circulation.",
    severity: "medium"
  },
  "mosaic": {
    name: "Mosaic Virus",
    treatment: "No chemical cure available. Remove infected plants immediately. Control aphid vectors with insecticides. Use virus-free planting material.",
    severity: "high"
  },
  "healthy": {
    name: "Healthy Leaf",
    treatment: "Continue regular monitoring and maintain good agricultural practices. Ensure proper nutrition and irrigation.",
    severity: "low"
  }
} as const;

export type DiseaseType = keyof typeof DiseaseInfo;
