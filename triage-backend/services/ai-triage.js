// Simulated AI Scoring Engine for Medical Triage
// In a real scenario, this would call an LLM (like Gemini) or ML Model to evaluate clinical text + vitals.

function computeTriageScore(symptomsText, vitals, age) {
    let score = 0;
    const text = symptomsText.toLowerCase();

    // 1. NLP Keyword extraction (Simulated)
    const criticalKeywords = ['chest pain', 'shortness of breath', 'stroke', 'unconscious', 'breathing', 'seizure', 'hemorrhage', 'heart attack', 'unresponsive'];
    const urgentKeywords = ['fracture', 'bleeding', 'severe pain', 'fever', 'head injury', 'vomiting', 'dizzy'];
    
    // Check for critical symptoms
    for (const kw of criticalKeywords) {
        if (text.includes(kw)) {
            score += 50;
        }
    }
    
    // Check for urgent symptoms
    for (const kw of urgentKeywords) {
        if (text.includes(kw)) {
            score += 20;
        }
    }

    // 2. Vitals Analysis
    if (vitals) {
        // Heart rate checks
        const hr = parseInt(vitals.heartRate);
        if (hr) {
            if (hr > 130 || hr < 40) score += 30;
            else if (hr > 100 || hr < 50) score += 15;
        }

        // Oxygen levels (SpO2)
        const spo2 = parseInt(vitals.oxygenLevel);
        if (spo2) {
            if (spo2 < 90) score += 40;
            else if (spo2 < 95) score += 20;
        }

        // Blood pressure parsing (e.g., "160/100")
        if (vitals.bloodPressure && vitals.bloodPressure.includes('/')) {
            const [sys, dia] = vitals.bloodPressure.split('/');
            const systolic = parseInt(sys);
            if (systolic > 180 || systolic < 90) score += 30;
        }
    }

    // 3. Age Risk Factor
    if (age > 65 || age < 2) {
        score += 10;
    }

    // 4. Categorize by Threshold
    let level = "Non-urgent";
    if (score >= 80) {
        level = "Critical"; // Immediate life-saving intervention needed
    } else if (score >= 40) {
        level = "Urgent"; // High risk, needs quick attention (Time critical)
    } else if (score >= 20) {
        level = "Standard"; // Can wait but needs care
    }

    // Cap score at 100 max, 0 min
    score = Math.min(Math.max(score, 0), 100);

    return { score, level };
}

module.exports = { computeTriageScore };
