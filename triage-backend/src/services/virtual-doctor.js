const { GoogleGenerativeAI } = require("@google/generative-ai");
const { OpenAI } = require("openai");

const SPECIALIST_SYSTEM_PROMPT = `You are Dr. Aria, a specialist-grade AI clinical triage physician with cross-disciplinary expertise in Internal Medicine, Cardiology, Emergency Medicine, and Pathology. Your logic is modeled on senior registrar performance at Top-Tier Clinical Institutions.

CLINICAL GUIDELINES & HEURISTICS:
1. DIFFERENTIAL DIAGNOSIS (DDx): For every presentation, mentally generate a DDx. Always prioritize "Must-Not-Miss" (life-threatening) conditions.
2. SOCRATES FRAMEWORK: Systematically evaluate pain/symptoms using Site, Onset, Character, Radiation, Associations, Time, Exacerbating factors, and Severity.
3. RED FLAG SCREENING: Explicitly screen for hemodynamic instability, respiratory distress, focal neurological deficits, and signs of systemic inflammatory response (Sepsis).
4. PATHOLOGY INTEGRATION: Recommend only evidence-based diagnostic tests. Provide market-realistic USD pricing for tests.
5. TRIAGE LOGIC: Categorize into Critical (Immediate), Urgent (<30 mins), or Standard (Waiting Room).

CONVERSATION PROTOCOL:
- MULTILINGUAL: Respond in the exact language the user initiates with.
- EMPATHY: Maintain a high-trust, professional, and empathetic clinical persona.
- ITERATION: Ask 1-2 sharp, clarifying clinical questions per turn. Gather Vitals if the user mentions home devices (BP cuff, Pulse-ox).
- FINALIZATION: Once sufficient data (symptoms, history, potential vitals) is gathered (usually 3-5 turns), conclude with a definitive assessment block.

ASSESSMENT OUTPUT SPECIFICATIONS:
You MUST conclude with the following JSON structure wrapped in <ASSESSMENT> tags. This is critical for downstream clinical systems:

<ASSESSMENT>
{
  "symptoms": "Precise clinical description of the presenting illness.",
  "history": "Concise medical/surgical history including medications/allergies.",
  "vitals": { "heartRate": "", "bloodPressure": "", "oxygenLevel": "", "temperature": "" },
  "primaryDiagnosis": "Most likely clinical diagnosis.",
  "differentials": ["List 2-3 credible alternative diagnoses."],
  "redFlags": ["Any life-threatening indicators identified."],
  "recommendedTests": [
    { "name": "Exact Test Name", "reason": "Clinical justification mapping to diagnosis", "urgency": "immediate|urgent|routine", "estimatedPrice": 0 }
  ],
  "specialistReferral": "Target department and specific specialist type.",
  "immediateActions": "Life-saving or symptom-relief actions for the patient right now.",
  "doctorNote": "A professional clinical summary for the receiving physician.",
  "readyToSave": true
}
</ASSESSMENT>`;

class VirtualDoctorService {
    constructor() {
        this.geminiKey = process.env.GEMINI_API_KEY;
        if (this.geminiKey) {
            this.genAI = new GoogleGenerativeAI(this.geminiKey);
            this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
        }
        this.openAiKey = process.env.OPENAI_API_KEY;
        if (this.openAiKey) {
            this.openai = new OpenAI({ apiKey: this.openAiKey });
        }
    }

    async _callGemini(prompt) {
        for (let attempt = 0; attempt < 3; attempt++) {
            try {
                if (!this.model) break;
                const result = await this.model.generateContent(prompt);
                return result.response.text();
            } catch (e) {
                const isRateLimit = e.message?.includes('Quota exceeded') || e.message?.includes('429') || e.message?.includes('RESOURCE_EXHAUSTED');
                if (isRateLimit && attempt < 2) {
                    await new Promise(r => setTimeout(r, (attempt + 1) * 10000));
                    continue;
                }
                console.error("Gemini error:", e.message?.substring(0, 120));
                break;
            }
        }
        return null;
    }

    async _callOpenAI(systemPrompt, messages) {
        try {
            if (!this.openai) return null;
            const res = await this.openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: systemPrompt },
                    ...messages.map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content }))
                ]
            });
            return res.choices[0].message.content;
        } catch (e) {
            console.error("OpenAI error:", e.message?.substring(0, 80));
            return null;
        }
    }

    async chat(messages, patientContext) {
        const contextLine = `Patient: ${patientContext.name || 'Unknown'}, Age: ${patientContext.age || 'unknown'}, Hospital: ${patientContext.hospitalName || 'General Hospital'}.`;
        const conversation = messages.map(m => `${m.role === 'user' ? 'Patient' : 'Dr. Aria'}: ${m.content}`).join('\n');
        const prompt = `${SPECIALIST_SYSTEM_PROMPT}\n\n${contextLine}\n\nConversation so far:\n${conversation}\n\nDr. Aria (respond now):`;

        const response = await this._callGemini(prompt) || await this._callOpenAI(SPECIALIST_SYSTEM_PROMPT, messages);
        return response || "I'm experiencing a connection issue. Please describe your most urgent symptom and I'll assist you.";
    }

    async suggestTests(diagnosis, symptoms, age) {
        const prompt = `You are a clinical pathologist. A patient aged ${age} presents with: "${symptoms}". Primary diagnosis: "${diagnosis}".

List the most clinically appropriate diagnostic tests. For each test provide realistic market pricing in USD.

Respond ONLY as valid JSON array:
[
  { "name": "Complete Blood Count (CBC)", "reason": "baseline infection/anemia screen", "urgency": "routine", "category": "Hematology", "estimatedPrice": 25, "homeCollectionAvailable": true, "turnaround": "4-6 hours" },
  ...
]
Include 4-8 tests maximum. Only clinically indicated tests.`;

        const raw = await this._callGemini(prompt) || await this._callOpenAI("You are a clinical pathologist. Return only valid JSON.", [{ role: 'user', content: prompt }]);
        if (!raw) return [];
        try {
            const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();
            const match = cleaned.match(/\[[\s\S]*\]/);
            return match ? JSON.parse(match[0]) : [];
        } catch { return []; }
    }

    parseAssessment(text) {
        const match = text.match(/<ASSESSMENT>([\s\S]*?)<\/ASSESSMENT>/);
        if (!match) return null;
        try { return JSON.parse(match[1].trim()); } catch { return null; }
    }

    cleanResponse(text) {
        return text.replace(/<ASSESSMENT>[\s\S]*?<\/ASSESSMENT>/g, '').trim();
    }

    async rankDepartmentPatients(patients, department) {
        if (!patients.length) return { ranking: [], summary: `No active patients in ${department}.` };

        const list = patients.slice(0, 20)
            .map((p, i) => `${i + 1}. ${p.name}, Age ${p.age}, Score ${p.score}, Level: ${p.triageLevel}, Chief complaint: ${p.symptoms?.substring(0, 60)}`)
            .join('\n');

        const prompt = `You are a senior triage nurse. Rank these ${department} patients by clinical urgency. Consider age, triage score, and symptoms. Be concise.

Patients:
${list}

Respond ONLY as valid JSON:
{
  "ranking": [{ "name": "...", "priority": "Critical|Urgent|Standard", "rank": 1, "reason": "one sentence clinical reason" }],
  "summary": "one sentence overall department status"
}`;

        const raw = await this._callGemini(prompt);
        if (raw) {
            try {
                const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();
                const match = cleaned.match(/\{[\s\S]*\}/);
                if (match) return JSON.parse(match[0]);
            } catch { /* fall through */ }
        }

        const sorted = [...patients].sort((a, b) => b.score - a.score);
        return {
            ranking: sorted.map((p, i) => ({ name: p.name, rank: i + 1, priority: p.triageLevel || 'Standard', reason: p.triageReasoning || 'Ranked by triage score' })),
            summary: `${department} has ${patients.length} active patients.`
        };
    }
}

module.exports = new VirtualDoctorService();
