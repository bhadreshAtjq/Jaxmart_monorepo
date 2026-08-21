/**
 * Official JaxMart GST Tax Invoice Generator & PDF Exporter
 * Formatted for standard single-page A4 plain paper output.
 */

export function generateInvoiceHTML(invoice: any): string {
  const seller = invoice.seller || {};
  const buyer = invoice.buyer || {};
  const items = invoice.items || [];
  const tax = invoice.taxBreakdown || {};
  const payment = invoice.payment || {};

  const issuedDate = new Date(invoice.date || invoice.issuedAt || Date.now()).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Tax_Invoice_${invoice.invoiceNumber || 'INV'}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 10mm 12mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    body {
      background: #ffffff;
      color: #0f172a;
      font-size: 11px;
      line-height: 1.4;
    }
    .invoice-box {
      width: 100%;
      max-width: 760px;
      margin: 0 auto;
      background: #ffffff;
      border: 1.5px solid #0f172a;
      padding: 24px;
    }
    
    /* Top Header */
    .header-table {
      width: 100%;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 14px;
      margin-bottom: 14px;
    }
    .company-title {
      font-size: 18px;
      font-weight: 900;
      color: #0f172a;
      letter-spacing: -0.3px;
    }
    .company-meta {
      font-size: 10px;
      color: #475569;
      margin-top: 2px;
      line-height: 1.35;
    }
    .invoice-badge {
      font-size: 18px;
      font-weight: 900;
      text-align: right;
      color: #0f172a;
      letter-spacing: 0.5px;
    }
    .invoice-subbadge {
      font-size: 10px;
      font-weight: 700;
      color: #64748b;
      text-align: right;
      text-transform: uppercase;
    }

    /* Meta Grid */
    .meta-box {
      display: table;
      width: 100%;
      border: 1px solid #cbd5e1;
      background: #f8fafc;
      margin-bottom: 14px;
    }
    .meta-row {
      display: table-row;
    }
    .meta-col {
      display: table-cell;
      padding: 6px 10px;
      font-size: 10.5px;
      border-right: 1px solid #e2e8f0;
    }
    .meta-col:last-child {
      border-right: none;
    }
    .meta-col strong {
      color: #0f172a;
    }

    /* Address Table */
    .party-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 14px;
    }
    .party-col {
      width: 50%;
      vertical-align: top;
      border: 1px solid #cbd5e1;
      padding: 10px 12px;
      background: #ffffff;
    }
    .party-col.left {
      border-right: 1px solid #cbd5e1;
    }
    .party-heading {
      font-size: 9.5px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #475569;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 4px;
      margin-bottom: 6px;
    }
    .party-name {
      font-size: 12px;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 2px;
    }
    .party-desc {
      font-size: 10px;
      color: #334155;
      line-height: 1.35;
    }

    /* Line Items Table */
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 14px;
    }
    .items-table th {
      background: #0f172a;
      color: #ffffff;
      font-size: 9.5px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.4px;
      padding: 7px 8px;
      border: 1px solid #0f172a;
      text-align: left;
    }
    .items-table th.num { text-align: right; }
    .items-table th.center { text-align: center; }
    .items-table td {
      border: 1px solid #cbd5e1;
      padding: 8px;
      font-size: 10.5px;
      color: #1e293b;
    }
    .items-table td.num { text-align: right; font-family: monospace; }
    .items-table td.center { text-align: center; }
    .items-table tr:nth-child(even) td { background: #f8fafc; }

    /* Summary Block */
    .summary-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 14px;
    }
    .summary-left {
      width: 55%;
      vertical-align: top;
      border: 1px solid #cbd5e1;
      padding: 10px;
      background: #f8fafc;
      font-size: 10px;
    }
    .summary-right {
      width: 45%;
      vertical-align: top;
      border: 1px solid #cbd5e1;
      border-left: none;
      padding: 0;
    }
    .calc-row {
      display: flex;
      justify-content: space-between;
      padding: 4px 10px;
      font-size: 10.5px;
      color: #334155;
      border-bottom: 1px solid #e2e8f0;
    }
    .calc-row:last-child {
      border-bottom: none;
    }
    .calc-row.grand {
      background: #0f172a;
      color: #ffffff;
      font-weight: 900;
      font-size: 12px;
      padding: 7px 10px;
    }

    /* Footer Stamp */
    .footer-table {
      width: 100%;
      border-top: 1.5px solid #0f172a;
      padding-top: 10px;
      font-size: 9.5px;
      color: #64748b;
    }
    .seal-box {
      text-align: right;
    }
    .seal-stamp {
      display: inline-block;
      border: 1.5px solid #0f172a;
      padding: 4px 10px;
      font-size: 9px;
      font-weight: 900;
      color: #0f172a;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-top: 4px;
    }

    @media print {
      body { background: #ffffff !important; padding: 0 !important; }
      .invoice-box { border: 1.5px solid #0f172a !important; max-width: 100% !important; padding: 18px !important; }
    }
  </style>
</head>
<body>
  <div class="invoice-box">
    <!-- Header -->
    <table class="header-table" cellpadding="0" cellspacing="0">
      <tr>
        <td style="vertical-align: top;">
          <div class="company-title">${seller.name || 'JaxMart Global Technologies Pvt. Ltd.'}</div>
          <div class="company-meta">
            ${seller.address || 'Suite 500, JaxMart Trade Towers, Bandra Kurla Complex'}<br>
            ${seller.city || 'Mumbai'}, ${seller.state || 'Maharashtra'} - ${seller.pincode || '400051'}<br>
            <strong>GSTIN:</strong> ${seller.gstin || '24AAACJ9988H1Z1'} | <strong>PAN:</strong> ${seller.pan || 'AAACJ9988H'} | <strong>CIN:</strong> U72900MH2024PTC123456
          </div>
        </td>
        <td style="vertical-align: top; text-align: right;">
          <div class="invoice-badge">TAX INVOICE</div>
          <div class="invoice-subbadge">Original for Recipient</div>
          <div style="font-size: 11px; font-weight: 800; color: #0f172a; margin-top: 4px; font-family: monospace;">
            # ${invoice.invoiceNumber || 'INV-001'}
          </div>
          <div style="font-size: 9.5px; color: #166534; font-weight: 800; background: #dcfce7; display: inline-block; padding: 2px 6px; border-radius: 4px; margin-top: 4px;">
            ● ${invoice.status || 'PAID'}
          </div>
        </td>
      </tr>
    </table>

    <!-- Meta Details Strip -->
    <div class="meta-box">
      <div class="meta-row">
        <div class="meta-col">Invoice Date: <strong>${issuedDate}</strong></div>
        <div class="meta-col">Place of Supply: <strong>${buyer.state || 'Gujarat'} (24)</strong></div>
        <div class="meta-col">Category: <strong>${invoice.category || 'B2B Trade / SaaS Services'}</strong></div>
      </div>
    </div>

    <!-- Parties (Seller & Buyer) -->
    <table class="party-table" cellpadding="0" cellspacing="0">
      <tr>
        <td class="party-col left">
          <div class="party-heading">Details of Supplier (Billed By)</div>
          <div class="party-name">${seller.name || 'JaxMart Global Technologies Pvt. Ltd.'}</div>
          <div class="party-desc">
            ${seller.address || 'Trade Towers, BKC'}, ${seller.city || 'Mumbai'}<br>
            State: ${seller.state || 'Maharashtra'} | Pincode: ${seller.pincode || '400051'}<br>
            <strong>GSTIN:</strong> ${seller.gstin || '24AAACJ9988H1Z1'}<br>
            <strong>SAC Code:</strong> ${seller.sacCode || '998313'}
          </div>
        </td>
        <td class="party-col">
          <div class="party-heading">Details of Recipient / Billed To</div>
          <div class="party-name">${buyer.name || 'Registered Merchant'}</div>
          <div class="party-desc">
            ${buyer.address || 'Primary Registered Commercial Address'}<br>
            ${buyer.city || 'Surat'}, ${buyer.state || 'Gujarat'} - ${buyer.pincode || '395006'}<br>
            <strong>GSTIN:</strong> ${buyer.gstin || 'Unregistered B2B User'}<br>
            <strong>PAN:</strong> ${buyer.pan || 'N/A'} | <strong>Phone:</strong> ${buyer.phone || 'N/A'}
          </div>
        </td>
      </tr>
    </table>

    <!-- Line Items Table -->
    <table class="items-table" cellpadding="0" cellspacing="0">
      <thead>
        <tr>
          <th style="width: 25px;" class="center">#</th>
          <th>Description of Goods / Services</th>
          <th style="width: 65px;" class="center">HSN/SAC</th>
          <th style="width: 35px;" class="center">Qty</th>
          <th style="width: 75px;" class="num">Taxable (₹)</th>
          <th style="width: 60px;" class="num">CGST (9%)</th>
          <th style="width: 60px;" class="num">SGST (9%)</th>
          <th style="width: 85px;" class="num">Total (₹)</th>
        </tr>
      </thead>
      <tbody>
        ${items.map((it: any, index: number) => `
          <tr>
            <td class="center">${index + 1}</td>
            <td><strong>${it.description}</strong></td>
            <td class="center" style="font-family: monospace;">${it.hsnSac || '998313'}</td>
            <td class="center">${it.qty || 1}</td>
            <td class="num">₹${Number(it.taxableValue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            <td class="num">₹${Number(it.cgstAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            <td class="num">₹${Number(it.sgstAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            <td class="num" style="font-weight: 800; color: #0f172a;">₹${Number(it.total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <!-- Summary & Payment Verification -->
    <table class="summary-table" cellpadding="0" cellspacing="0">
      <tr>
        <td class="summary-left">
          <strong style="color: #0f172a; text-transform: uppercase; font-size: 9.5px; letter-spacing: 0.4px;">Payment Settlement Record</strong>
          <p style="margin-top: 4px;">Payment Mode: <strong>${payment.method || 'RAZORPAY_ESCROW'}</strong></p>
          <p>Gateway Reference ID: <strong style="font-family: monospace;">${payment.referenceId || 'ESCROW-VERIFIED'}</strong></p>
          <p>Settlement Date: <strong>${issuedDate}</strong></p>
          <p style="margin-top: 6px; font-size: 9px; color: #64748b;">
            Electronically generated tax invoice under Central Goods and Services Tax Rules, 2017.
          </p>
        </td>
        <td class="summary-right">
          <div class="calc-row">
            <span>Taxable Amount (Subtotal):</span>
            <strong style="font-family: monospace;">₹${Number(tax.taxableValue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
          </div>
          <div class="calc-row">
            <span>CGST (Central Tax 9.0%):</span>
            <span style="font-family: monospace;">₹${Number(tax.cgst || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
          <div class="calc-row">
            <span>SGST (State Tax 9.0%):</span>
            <span style="font-family: monospace;">₹${Number(tax.sgst || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
          <div class="calc-row" style="background: #f1f5f9; font-weight: 700;">
            <span>Total Tax (GST 18.0%):</span>
            <strong style="font-family: monospace;">₹${Number(tax.totalGst || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
          </div>
          <div class="calc-row grand">
            <span>Grand Total (INR):</span>
            <span style="font-size: 13px; font-family: monospace;">₹${Number(tax.grandTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
        </td>
      </tr>
    </table>

    <!-- Footer Seal -->
    <table class="footer-table" cellpadding="0" cellspacing="0">
      <tr>
        <td style="vertical-align: middle;">
          JaxMart Global Technologies Pvt. Ltd. • CIN: U72900MH2024PTC123456<br>
          Computer-generated document. Valid without physical signature.
        </td>
        <td class="seal-box" style="vertical-align: middle;">
          <div style="font-weight: 800; font-size: 10px; color: #0f172a;">For JaxMart Technologies Pvt. Ltd.</div>
          <div class="seal-stamp">AUTHORISED SIGNATORY (DIGITAL)</div>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>`;
}

/**
 * Clean Single-Page Invoice Printing via Hidden Isolated Iframe
 * (Prevents printing website headers, background overlays, or multiple pages)
 */
export function printTaxInvoice(invoice: any) {
  const html = generateInvoiceHTML(invoice);

  // Remove existing print iframe if any
  const oldIframe = document.getElementById('jaxmart-tax-invoice-iframe');
  if (oldIframe) {
    document.body.removeChild(oldIframe);
  }

  const iframe = document.createElement('iframe');
  iframe.id = 'jaxmart-tax-invoice-iframe';
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document || iframe.contentDocument;
  if (doc) {
    doc.open();
    doc.write(html);
    doc.close();

    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (err) {
        console.error('Print iframe error:', err);
      }
    }, 300);
  }
}

/**
 * Direct Download / Print Trigger for Tax Invoice
 */
export function downloadTaxInvoice(invoice: any) {
  printTaxInvoice(invoice);
}
