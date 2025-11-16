const express = require("express");
const router = express.Router();
const { analyze } = require("../services/javaParser");

router.post("/", async (req, res) => {
    try {
        const { code } = req.body;
        
        if (!code) {
            return res.status(400).json({ error: "No code provided" });
        }
        
        const result = await analyze(code);
        res.json(result);
    } catch (error) {
        console.error("Analysis error:", error);
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
