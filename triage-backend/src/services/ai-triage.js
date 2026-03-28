// Simulated AI Scoring Engine for Medical Triage
// In a real scenario, this would call an LLM (like Gemini) or ML Model to evaluate clinical text + vitals.

function computeTriageScore(symptomsText, vitals, age, historyText = "") {
    let score = 0;
    const text = symptomsText.toLowerCase();
    let reasoningArr = [];

    // 1. NLP Keyword extraction (Simulated)
    const criticalKeywords = ['chest pain', 'shortness of breath', 'stroke', 'unconscious', 'breathing', 'seizure', 'hemorrhage', 'heart attack', 'unresponsive', 'sepsis', 'anaphylaxis'];
    const urgentKeywords = ['fracture', 'bleeding', 'severe pain', 'fever', 'head injury', 'vomiting', 'dizzy', 'infection'];
    
    // Check for critical symptoms
    for (const kw of criticalKeywords) {
        if (text.includes(kw)) {
            score += 50;
            reasoningArr.push(`Critical symptom detected: ${kw}`);
        }
    }
    
    // Check for urgent symptoms
    for (const kw of urgentKeywords) {
        if (text.includes(kw)) {
            score += 20;
            reasoningArr.push(`Urgent symptom detected: ${kw}`);
        }
    }

    // 2. Vitals Analysis - EARLY DETECTION OF CRITICAL CASES
    if (vitals) {
        // Heart rate checks
        const hr = parseInt(vitals.heartRate);
        if (hr) {
            if (hr > 130 || hr < 40) {
                score += 30;
                reasoningArr.push(`Abnormal HR (${hr} bpm)`);
            }
            else if (hr > 100 || hr < 50) {
                score += 15;
            }
        }

        // Oxygen levels (SpO2)
        const spo2 = parseInt(vitals.oxygenLevel);
        if (spo2) {
            if (spo2 < 90) {
                score += 40;
                reasoningArr.push(`Critical hypoxia (SpO2: ${spo2}%)`);
            }
            else if (spo2 < 95) {
                score += 20;
                reasoningArr.push(`Mild hypoxia (SpO2: ${spo2}%)`);
            }
        }

        // Blood pressure parsing (e.g., "160/100")
        if (vitals.bloodPressure && vitals.bloodPressure.includes('/')) {
            const [sys, dia] = vitals.bloodPressure.split('/');
            const systolic = parseInt(sys);
            if (systolic > 180 || systolic < 90) {
                score += 30;
                reasoningArr.push(`Critical BP (${vitals.bloodPressure})`);
            }
        }
    }

    // 3. Age & History Risk Factors
    if (age > 65 || age < 2) {
        score += 10;
        reasoningArr.push(`High-risk age demographic`);
    }
    
    const hist = historyText.toLowerCase();
    const riskHistory = ['diabetes', 'asthma', 'heart disease', 'hypertension', 'cancer', 'pregnant', 'smoker'];
    for (const kw of riskHistory) {
        if (hist.includes(kw)) {
            score += 15;
            reasoningArr.push(`Patient history risk: ${kw}`);
            break;
        }
    }

    // 4. Categorize by Threshold
    let level = "Non-urgent";
    let estimatedWaitTime = "120+ mins";

    if (score >= 80) {
        level = "Critical"; // Immediate life-saving intervention needed
        estimatedWaitTime = "0 mins (Immediate)";
    } else if (score >= 40) {
        level = "Urgent"; // High risk, needs quick attention (Time critical)
        estimatedWaitTime = "15 - 30 mins";
    } else if (score >= 20) {
        level = "Standard"; // Can wait but needs care
        estimatedWaitTime = "45 - 60 mins";
    }

    // Cap score at 100 max, 0 min
    score = Math.min(Math.max(score, 0), 100);

    let recommendedDoctor = "General Physician";
    const combinedText = (text + " " + hist).toLowerCase();

    if (combinedText.includes('chest pain') || combinedText.includes('heart attack') || combinedText.includes('heart disease') || combinedText.includes('hypertension')) {
        recommendedDoctor = "Cardiologist";
    } else if (combinedText.includes('stroke') || combinedText.includes('seizure') || combinedText.includes('head injury') || combinedText.includes('unconscious') || combinedText.includes('unresponsive')) {
        recommendedDoctor = "Neurologist";
    } else if (combinedText.includes('shortness of breath') || combinedText.includes('asthma') || combinedText.includes('breathing')) {
        recommendedDoctor = "Pulmonologist";
    } else if (combinedText.includes('fracture') || combinedText.includes('bone')) {
        recommendedDoctor = "Orthopedist";
    } else if (combinedText.includes('pregnant') || combinedText.includes('pregnancy')) {
        recommendedDoctor = "Obstetrician/Gynecologist";
    } else if (combinedText.includes('diabetes')) {
        recommendedDoctor = "Endocrinologist";
    } else if (combinedText.includes('vomiting') || combinedText.includes('stomach') || combinedText.includes('abdomen') || combinedText.includes('nausea')) {
        recommendedDoctor = "Gastroenterologist";
    } else if (combinedText.includes('fever') || combinedText.includes('infection') || combinedText.includes('sepsis')) {
        recommendedDoctor = "Infectious Disease Specialist";
    } else if (combinedText.includes('eye') || combinedText.includes('vision')) {
        recommendedDoctor = "Ophthalmologist";
    }

    if (level === "Critical") {
        recommendedDoctor = "Emergency Physician (" + recommendedDoctor + " Consult)";
    } else if (level === "Urgent") {
        recommendedDoctor = recommendedDoctor === "General Physician" ? "Urgent Care Physician" : recommendedDoctor + " (Priority)";
    }

    // 5. Suggest Department based on symptoms
    let recommendedDepartment = "General Practice";
    if (text.includes('chest pain') || text.includes('heart attack') || text.includes('heart')) {
        recommendedDepartment = "Cardiology";
    } else if (text.includes('stroke') || text.includes('seizure') || text.includes('unconscious') || text.includes('dizzy') || text.includes('headache')) {
        recommendedDepartment = "Neurology";
    } else if (text.includes('fracture') || text.includes('bone') || text.includes('joint')) {
        recommendedDepartment = "Orthopedics";
    } else if (text.includes('bleeding') || text.includes('hemorrhage') || text.includes('severe pain') || text.includes('head injury')) {
        recommendedDepartment = "Emergency / Trauma";
    } else if (text.includes('shortness of breath') || text.includes('breathing') || text.includes('asthma') || text.includes('cough')) {
        recommendedDepartment = "Pulmonology";
    }

    const triageReasoning = reasoningArr.length > 0 ? reasoningArr.join(" | ") : "No high-risk indicators detected.";

    return { score, level, recommendedDoctor, recommendedDepartment, triageReasoning, estimatedWaitTime };
}

module.exports = { computeTriageScore };
