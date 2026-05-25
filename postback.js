const router = require("express").Router();
const Worker = require("./Worker");
const Lead = require("./Lead");
const Offer = require("./Offer");

async function handlePostback(query, ip, ua) {
  const { worker_id, offer_id, payout, status = "lead", click_id } = query;
  if (!worker_id) return { error: "worker_id required" };

  const worker = await Worker.findOne({ workerId: worker_id });
  if (!worker) return { error: "Worker not found" };
  if (worker.status !== "approved") return { error: "Worker not approved" };

  // Get payout from offer DB if not provided
  let resolvedPayout = parseFloat(payout) || 0;
  let offerName = offer_id || "unknown";
  if (!resolvedPayout && offer_id) {
    const offer = await Offer.findOne({ offerId: offer_id });
    if (offer) { resolvedPayout = offer.payout; offerName = offer.name; }
  } else if (offer_id) {
    const offer = await Offer.findOne({ offerId: offer_id });
    if (offer) offerName = offer.name;
  }

  const lead = await Lead.create({
    workerId:  worker_id,
    offerId:   offer_id || "unknown",
    offerName,
    payout:    resolvedPayout,
    status,
    clickId:   click_id || "",
    ip:        ip || "",
    userAgent: ua || "",
  });

  // Credit balance if not rejected
  if (status !== "reject" && status !== "rejected") {
    await Worker.findOneAndUpdate(
      { workerId: worker_id },
      { $inc: { balance: resolvedPayout, totalEarned: resolvedPayout, totalLeads: 1 } }
    );
  }

  return { success: true, lead: lead._id, worker: worker.fullName, credited: resolvedPayout, offer: offerName };
}

// GET postback
router.get("/", async (req, res) => {
  try {
    const result = await handlePostback(req.query, req.ip, req.headers["user-agent"]);
    if (result.error) return res.status(400).json(result);
    res.json(result);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// POST postback
router.post("/", async (req, res) => {
  try {
    const query = { ...req.query, ...req.body };
    const result = await handlePostback(query, req.ip, req.headers["user-agent"]);
    if (result.error) return res.status(400).json(result);
    res.json(result);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
