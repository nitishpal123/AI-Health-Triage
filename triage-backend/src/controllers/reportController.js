const fs = require('fs');
const pdfParse = require('pdf-parse');
const reportAnalyzer = require('../services/report-analyzer');

const processReport = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ status: "error", message: "No report file attached" });
        }

        let extractedText = "";

        // Text Extraction Handling
        if (req.file.mimetype === 'application/pdf') {
            const dataBuffer = fs.readFileSync(req.file.path);
            const pdfData = await pdfParse(dataBuffer);
            extractedText = pdfData.text;
        } else {
            // Note: If an image is passed, you would route it to Azure OCR / Tesseract.js here. 
            // For now, if the user sends `.txt`, we'll read it.
            extractedText = fs.readFileSync(req.file.path, 'utf8');
        }

        // Wipe temp file asynchronously 
        fs.unlink(req.file.path, (err) => { if (err) console.error("Temp file issue", err); });

        if (extractedText.length < 20) {
            return res.status(400).json({ status: "error", message: "Insufficient text extracted from document."});
        }

        console.log(`[🤖] Sending ${extractedText.length} characters to AI Analyzer Service...`);
        const analysisResult = await reportAnalyzer.analyzeReport(extractedText);

        return res.status(200).json({
            status: "success",
            filename: req.file.originalname,
            analysis: analysisResult
        });

    } catch (err) {
        console.error("Report Processing Error:", err);
        return res.status(500).json({ status: "error", message: err.message });
    }
}

module.exports = {
    processReport
};
