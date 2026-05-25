const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema({
  offerId:   { type: String, unique: true },
  name:      { type: String, required: true },
  payout:    { type: Number, required: true },
  link:      { type: String, required: true },
  category:  { type: String, default: "CPA" },
  status:    { type: String, enum: ["active","inactive"], default: "active" },
  description: { type: String, default: "" },
}, { timestamps: true });

offerSchema.pre("save", async function(next) {
  if (!this.offerId) {
    const count = await mongoose.model("Offer").countDocuments();
    this.offerId = String(count + 1);
  }
  next();
});

module.exports = mongoose.model("Offer", offerSchema);
