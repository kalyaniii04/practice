import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { InferenceClient } from "@huggingface/inference";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});


/* =========================
   Hugging Face Client
========================= */
const HF_TOKEN = process.env.HF_API_KEY;

if (!HF_TOKEN) {
  console.error("❌ ERROR: HF_TOKEN not found in .env");
  process.exit(1);
}

console.log("✅ HF_TOKEN loaded:", HF_TOKEN.substring(0, 4) + "...");

const client = new InferenceClient(HF_TOKEN);

/* =========================
   Generate Image Endpoint
========================= */
app.post("/generate-image", async (req, res) => {
  try {
    const { inputs } = req.body;

    if (!inputs) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    console.log(`🖼️ Generating image for: "${inputs}"`);

    const imageBlob = await client.textToImage({
      provider: "nebius",
      model: "black-forest-labs/FLUX.1-dev",
      inputs,
      parameters: { num_inference_steps: 5 }
    });

    const buffer = Buffer.from(await imageBlob.arrayBuffer());

    res.set("Content-Type", "image/png");
    res.send(buffer);

    console.log("✅ Image sent to frontend");

  } catch (err) {
    console.error("❌ Generation Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   Server Start
========================= */
app.listen(3000, () => {
  console.log("🚀 Server running at http://localhost:3000");
});
