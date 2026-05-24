export function generateInvoice(wd, worker) {
  const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<title>Invoice #${wd.withdrawalId || wd._id}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a2e; background: #fff; padding: 48px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 3px solid #1a6bff; padding-bottom: 24px; }
  .brand { font-size: 26px; font-weight: 800; color: #1a6bff; letter-spacing: -0.5px; }
  .brand-sub { font-size: 12px; color: #666; margin-top: 4px; letter-spacing: 2px; text-transform: uppercase; }
  .invoice-tag { font-size: 32px; font-weight: 800; color: #1a1a2e; }
  .invoice-num { font-size: 14px; color: #666; margin-top: 4px; }
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-bottom: 36px; }
  .label { font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #999; margin-bottom: 8px; font-weight: 600; }
  .value { font-size: 14px; color: #1a1a2e; line-height: 1.7; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
  th { background: #f0f4ff; color: #1a6bff; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; padding: 12px 16px; text-align: left; }
  td { padding: 14px 16px; border-bottom: 1px solid #f0f0f0; font-size: 14px; }
  .total-row td { font-weight: 700; font-size: 16px; color: #1a6bff; border-top: 2px solid #1a6bff; border-bottom: none; }
  .status-badge { display: inline-block; padding: 4px 16px; border-radius: 20px; font-size: 12px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; background: ${wd.status === "paid" ? "#e8f5e9" : "#fff8e1"}; color: ${wd.status === "paid" ? "#1b5e20" : "#e65100"}; }
  .footer { margin-top: 48px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #999; display: flex; justify-content: space-between; }
</style>
</head>
<body>
  <div class="header">
    <div><div class="brand">ADaffiliateMedia</div><div class="brand-sub">Affiliate Payment Invoice</div></div>
    <div style="text-align:right"><div class="invoice-tag">INVOICE</div><div class="invoice-num">#${wd.withdrawalId || wd._id}</div><div style="font-size:13px;color:#666;margin-top:4px">${new Date(wd.createdAt).toLocaleDateString("en-US", { year:"numeric", month:"long", day:"numeric" })}</div></div>
  </div>
  <div class="grid-2">
    <div>
      <div class="label">Bill To</div>
      <div class="value">
        <strong>${worker?.fullName || wd.workerName}</strong><br>
        ${worker?.email || ""}<br>
        ${worker?.address ? worker.address + "<br>" : ""}
        ${worker?.city || ""} ${worker?.state || ""} ${worker?.zipcode || ""}<br>
        ${worker?.country || ""}
      </div>
    </div>
    <div>
      <div class="label">Payment Details</div>
      <div class="value">
        <strong>Method:</strong> ${wd.method}<br>
        <strong>Account:</strong> ${wd.account}<br>
        <strong>Status:</strong> <span class="status-badge">${wd.status}</span><br>
        ${wd.paidAt ? "<strong>Paid On:</strong> " + new Date(wd.paidAt).toLocaleDateString() : ""}
      </div>
    </div>
  </div>
  <table>
    <thead><tr><th>Description</th><th>Worker ID</th><th>Period</th><th>Amount (USD)</th></tr></thead>
    <tbody>
      <tr><td>Affiliate Earnings — Net-30</td><td>${wd.workerId}</td><td>${new Date(wd.createdAt).toLocaleDateString()}</td><td><strong>$${parseFloat(wd.amount).toFixed(2)}</strong></td></tr>
    </tbody>
    <tfoot>
      <tr class="total-row"><td colspan="3" style="text-align:right">Total Due</td><td>$${parseFloat(wd.amount).toFixed(2)} USD</td></tr>
    </tfoot>
  </table>
  <div class="footer">
    <div>ADaffiliateMedia · contact@adaffiliatemedia.com</div>
    <div>Payment Terms: Net-30 · Minimum Payout: $50</div>
  </div>
</body></html>`;

  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `invoice_${wd.withdrawalId || wd._id}.html`;
  a.click();
  URL.revokeObjectURL(url);
}
