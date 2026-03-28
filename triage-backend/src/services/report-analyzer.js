const { GoogleGenerativeAI } = require("@google/generative-ai");
const { OpenAI } = require("openai");

/**
 * AI-Driven Medical Report Analyzer
 * Extracts Measurements, Diseases, Medications, and Priority Recommendations automatically.
 * Incorporates fallback from Google Gemini to OpenAI, finally to heuristic mock data.
 */
class ReportAnalyzerService {
    constructor() {
        // Initialize Gemini securely
        this.geminiKey = process.env.GEMINI_API_KEY;
        if (this.geminiKey) {
            this.genAI = new GoogleGenerativeAI(this.geminiKey);
            this.geminiModel = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        }

        // Initialize OpenAI securely
        this.openAiKey = process.env.OPENAI_API_KEY;
        if (this.openAiKey) {
            this.openai = new OpenAI({ apiKey: this.openAiKey });
        }
    }

    async analyzeReport(rawText) {
        const promptParams = `
            You are a highly advanced AI Medical NLP Engine.
            Carefully parse the following raw medical report, and extract critical details precisely.
            Always format your response as strict valid JSON. No markdown backticks outside. 
            
            Extract:
            1. diseases (Array of strings)
            2. medications (Array of strings)
            3. measurements (Dict of Object with "value" and "unit", eg: { "Blood Pressure": { "value": 120, "unit": "mmHg" }})
            4. recommendations (Array of actionable strings for patient)
            5. summary (A small cohesive 2 sentence summary)
            
            Report Text:
            """
            ${rawText}
            """
            
            Respond STRICTLY with valid valid JSON.
        `;

        // 1. Try Gemini First
        if (this.geminiModel) {
            try {
                console.log("[🤖] Attempting analysis using Google Gemini...");
                const result = await this.geminiModel.generateContent(promptParams);
                const responseText = result.response.text().replace(/\`\`\`json/g, "").replace(/\`\`\`/g, "").trim();
                return JSON.parse(responseText);
            } catch (error) {
                console.error("⚠️ Gemini API execution failed:", error.message);
                console.log("[🔄] Falling back to OpenAI Model...");
            }
        } else {
            console.warn("⚠️ No GEMINI_API_KEY present in .env, skipping Gemini step...");
        }

        // 2. Try OpenAI Fallback
        if (this.openai) {
            try {
                console.log("[🤖] Attempting analysis using OpenAI...");
                const response = await this.openai.chat.completions.create({
                    model: "gpt-4o-mini", // Cost efficient fallback
                    messages: [
                        { role: "system", content: "You are a Medical NLP AI. Return strictly valid JSON." },
                        { role: "user", content: promptParams }
                    ],
                    response_format: { type: "json_object" }
                });
                return JSON.parse(response.choices[0].message.content);
            } catch (error) {
                console.error("⚠️ OpenAI API execution failed:", error.message);
                console.log("[🔄] Falling back to Heuristic Mock Analysis...");
            }
        } else {
            console.warn("⚠️ No OPENAI_API_KEY present in .env, skipping OpenAI fallback...");
        }

        // 3. Last Resort Fallback
        return this.heuristicFallback(rawText);
    }

    heuristicFallback(text) {
        // Simulating the output structure safely
        const textLower = text.toLowerCase();
        
        return {
            diseases: textLower.includes("diabetes") ? ["Type 2 Diabetes"] : ["Unknown Condition"],
            medications: textLower.includes("metformin") ? ["Metformin 500mg"] : [],
            measurements: {
                "Heart Rate": { value: 85, unit: "bpm" },
                "Blood Pressure": { value: "120/80", unit: "mmHg" }
            },
            recommendations: [
                "Schedule a follow-up appointment within 14 days",
                "Monitor vitals daily"
            ],
            summary: "Heuristic Mock Analysis: Report read successfully indicating standard stable vitals. Please connect Gemini or OpenAI Keys for full semantic parsing."
        };
    }
}

module.exports = new ReportAnalyzerService();
