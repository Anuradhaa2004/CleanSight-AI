const Groq = require('groq-sdk');
const fs = require('fs');

// Initialize Groq. Fallback to GEMINI_API_KEY just in case you didn't rename the variable in .env
const apiKey = process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY;

const groq = apiKey ? new Groq({ apiKey }) : null;

const categorizeWasteImage = async (imagePath, mimeType) => {
  if (!groq) {
      console.log("No Groq API key found. AI categorization skipped.");
      return null;
  }

  try {
    const imageData = fs.readFileSync(imagePath).toString('base64');
    const base64Url = `data:${mimeType};base64,${imageData}`;
    
    const prompt = `You are an expert civic issue categorization AI. 
Analyze the image and categorize the primary civic issue shown into EXACTLY ONE of these categories:
1. "Dead Animal" (carcasses, animal remains)
2. "Potholes" (broken road, severe asphalt damage, large holes)
3. "Sewer Damage" (clogged drains, broken manholes, wastewater leaks, sewage)
4. "General Waste" (garbage, litter dumps, loose trash, overflowing bins)

IMPORTANT: You must respond in STRICT JSON format. Do not use markdown blocks. Do not add any conversational text.
{
  "category": "exact category string from the 4 options above",
  "confidence": score from 0 to 100 representing certainty
}`;

    const response = await groq.chat.completions.create({
      model: "llama-3.2-11b-vision-preview",
      temperature: 0.2, // low temperature for strict compliance
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: {
                url: base64Url,
              },
            },
          ],
        },
      ],
    });

    const output = response.choices[0]?.message?.content || "";
    console.log("Raw Groq Output:\n", output);
    
    let category = 'General Waste';
    let confidence = 85;

    // Advanced Parsing
    try {
      // Find JSON block if it wrapped it in markdown
      const jsonStr = output.replace(/```json/gi, '').replace(/```/gi, '').trim();
      const match = jsonStr.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        category = parsed.category || 'General Waste';
        confidence = parseFloat(parsed.confidence) || 85;
      } else {
        throw new Error("No JSON found");
      }
    } catch (e) {
      // Robust Fallback parsing if JSON parsing fails completely
      const outLower = output.toLowerCase();
      if (outLower.includes('pothole') || outLower.includes('road')) category = 'Potholes';
      else if (outLower.includes('dead') || outLower.includes('animal') || outLower.includes('carcass')) category = 'Dead Animal';
      else if (outLower.includes('sewer') || outLower.includes('drain')) category = 'Sewer Damage';
      
      const confMatch = output.match(/confidence["\s:]*([\d.]+)/i);
      if (confMatch) confidence = parseFloat(confMatch[1]);
    }

    // Normalize category bounds
    const validCategories = ['Dead Animal', 'Sewer Damage', 'Potholes', 'General Waste'];
    if (!validCategories.includes(category)) {
      const lowered = category.toLowerCase();
      if (lowered.includes('pothole')) category = 'Potholes';
      else if (lowered.includes('animal') || lowered.includes('dead')) category = 'Dead Animal';
      else if (lowered.includes('sewer') || lowered.includes('drain')) category = 'Sewer Damage';
      else category = 'General Waste';
    }

    return { category, confidence: Math.round(confidence), raw: output };

  } catch (error) {
    console.error('Error categorizing image with Groq API:', error);
    return { category: 'General Waste', confidence: 50, raw: 'Fallback due to API error' };
  }
};

module.exports = { categorizeWasteImage };
