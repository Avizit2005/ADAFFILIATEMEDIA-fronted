const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());

app.use("/api/auth",        require("./auth"));
app.use("/api/workers",     require("./workers"));
app.use("/api/offers",      require("./offers"));
app.use("/api/leads",       require("./leads"));
app.use("/api/withdrawals", require("./withdrawals"));
app.use("/api/workerlinks", require("./workerlinks"));
app.use("/postback",        require("./postback"));

app.get("/", (req, res) => res.json({ status: "ADaffiliateMedia API running", version: "1.0.0" }));

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(process.env.PORT || 5000, () =>
      console.log(`🚀 Server running on port ${process.env.PORT || 5000}`)
    );
  })
  .catch(err => { console.error("MongoDB error:", err); process.exit(1); });
