const express = require("express");
const cors = require("cors");
const analyzeRouter = require("./routes/analyze");

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.use("/api", analyzeRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Compiler backend listening on http://localhost:${PORT}`);
});
