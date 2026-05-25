const router = require("express").Router();
const auth = require("./authmw");
const Offer = require("./Offer");

const DEFAULT_OFFERS = [
  { offerId:"1", name:"Rent To Own Gateway",            payout:1.0,  link:"https://getownrenthomeus.netlify.app/",   category:"CPA", status:"active" },
  { offerId:"2", name:"Rent2Own",                        payout:1.3,  link:"https://renttoownhomeus.netlify.app/",    category:"CPA", status:"active" },
  { offerId:"3", name:"CreditScoreIQ - $1 7 Day Trial", payout:15.0, link:"https://creditscore1dollar.netlify.app/", category:"CPA", status:"active" },
  { offerId:"4", name:"TransUnion Credit Scores Trial",  payout:30.0, link:"https://transunionscore.netlify.app/",   category:"CPA", status:"active" },
  { offerId:"5", name:"Win a $1000 Amazon Gift Card",   payout:1.0,  link:"https://amazonreward998.netlify.app/",   category:"CPA", status:"active" },
  { offerId:"6", name:"Cash App Gift Card",             payout:1.3,  link:"https://cashappreward664.netlify.app/",  category:"CPA", status:"active" },
  { offerId:"7", name:"FlexJobs Work Opportunities",    payout:3.0,  link:"https://usremoteflexjob.netlify.app/",   category:"CPA", status:"active" },
];

// Seed default offers if DB empty
async function seedOffers() {
  const count = await Offer.countDocuments();
  if (count === 0) {
    await Offer.insertMany(DEFAULT_OFFERS);
    console.log("✅ Default offers seeded");
  }
}
seedOffers();

// GET all offers (workers + admin) — with worker tracking link
router.get("/", auth, async (req, res) => {
  try {
    const offers = await Offer.find({ status: "active" }).sort({ offerId: 1 });
    const workerId = req.user.workerId || "DEMO";
    const result = offers.map(o => ({
      ...o.toObject(),
      trackingLink: `${o.link}${o.link.includes("?")?"&":"?"}click_id=${workerId}_${Date.now()}&aff=${workerId}&offer=${o.offerId}`,
    }));
    res.json(result);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// GET all offers including inactive (admin only)
router.get("/all", auth.adminOnly, async (req, res) => {
  try {
    const offers = await Offer.find().sort({ createdAt: -1 });
    res.json(offers);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ADD new offer (admin)
router.post("/", auth.adminOnly, async (req, res) => {
  try {
    const { name, payout, link, category, description } = req.body;
    if (!name || !payout || !link) return res.status(400).json({ error: "name, payout, link required" });
    const offer = await Offer.create({ name, payout: parseFloat(payout), link, category: category||"CPA", description: description||"" });
    res.json(offer);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// UPDATE offer (admin)
router.patch("/:id", auth.adminOnly, async (req, res) => {
  try {
    const { name, payout, link, category, status, description } = req.body;
    const update = {};
    if (name !== undefined)        update.name = name;
    if (payout !== undefined)      update.payout = parseFloat(payout);
    if (link !== undefined)        update.link = link;
    if (category !== undefined)    update.category = category;
    if (status !== undefined)      update.status = status;
    if (description !== undefined) update.description = description;
    const offer = await Offer.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json(offer);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// DELETE offer (admin)
router.delete("/:id", auth.adminOnly, async (req, res) => {
  try {
    await Offer.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// GET smartlinks
router.get("/smartlinks", auth, (req, res) => {
  const workerId = req.user.workerId || "DEMO";
  res.json([
    { id:"sl1", name:"General Smartlink", description:"Auto-optimized — routes to best converting offer", link:`https://adaffiliatemedia.vercel.app/go/general?wid=${workerId}` },
    { id:"sl2", name:"Finance Smartlink", description:"Finance & credit offer rotator", link:`https://adaffiliatemedia.vercel.app/go/finance?wid=${workerId}` },
  ]);
});

module.exports = router;
