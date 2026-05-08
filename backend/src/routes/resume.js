import express from 'express';
import multer from 'multer';
import Groq from 'groq-sdk';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

router.post('/', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    let text = '';

    if (req.file.mimetype === 'application/pdf') {
      const parsed = await pdfParse(req.file.buffer);
      text = parsed.text;
    } else if (req.file.mimetype === 'text/plain') {
      text = req.file.buffer.toString('utf-8');
    } else {
      return res.status(400).json({ error: 'Only PDF and TXT files are supported' });
    }

    if (!text.trim()) {
      return res.status(400).json({ error: 'Could not extract text from file' });
    }

    const response = await client.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: `Parse the following resume and extract structured information. Return ONLY valid JSON with these fields:
{
  "name": "full name",
  "email": "email address",
  "phone": "phone number",
  "location": "city, state",
  "summary": "professional summary (2-3 sentences)",
  "skills": ["skill1", "skill2", ...],
  "experience": [{"title": "job title", "company": "company name", "duration": "dates", "description": "brief description"}],
  "education": [{"degree": "degree name", "school": "school name", "year": "graduation year"}],
  "suggestedRoles": ["role1", "role2", "role3"]
}

Resume text:
${text}`,
        },
      ],
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return res.status(500).json({ error: 'Unexpected response from AI' });
    }

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.status(500).json({ error: 'Could not parse AI response' });
    }

    const parsed = JSON.parse(jsonMatch[0] ?? content);
    res.json({ success: true, data: parsed });
  } catch (err) {
    console.error('Resume parse error:', err);
    res.status(500).json({ error: err.message || 'Failed to parse resume' });
  }
});

export default router;
