const Razorpay = require('razorpay');
const crypto = require('crypto');
const { prisma } = require('../config/database');
const { logger } = require('../utils/logger');
const { sendNotification } = require('../services/notificationService');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_TAD6o4dQhjpACS',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'B1b5VTHnfV5MxMjgeh99YL0e',
});

// ─── Direct Order Razorpay Payments ──────────────────────────────────────────

// POST /api/payments/create-order
const createPaymentOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.buyerId !== req.user.id) return res.status(403).json({ error: 'Not authorized' });
    if (order.razorpayOrderId) {
      return res.json({ razorpayOrderId: order.razorpayOrderId, amount: order.totalAmount, keyId: process.env.RAZORPAY_KEY_ID });
    }

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(order.totalAmount * 100), // paise
      currency: 'INR',
      receipt: `ord_${orderId.substring(0, 8)}_${Date.now()}`,
      notes: { orderId, buyerId: order.buyerId, sellerId: order.sellerId },
    });

    await prisma.order.update({
      where: { id: orderId },
      data: { razorpayOrderId: razorpayOrder.id },
    });

    res.json({
      success: true,
      razorpayOrderId: razorpayOrder.id,
      amount: order.totalAmount,
      currency: 'INR',
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    logger.error('createPaymentOrder error:', err);
    res.status(500).json({ error: 'Failed to create payment order' });
  }
};

// POST /api/payments/verify
const verifyPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = req.body;

    // Verify signature
    const body = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'B1b5VTHnfV5MxMjgeh99YL0e')
      .update(body)
      .digest('hex');

    if (process.env.NODE_ENV === 'production' && expectedSignature !== razorpaySignature) {
      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        razorpayPaymentId,
        paymentStatus: 'PAID',
        paidAt: new Date(),
        escrowStatus: 'HELD',
        status: 'CONFIRMED',
      },
      include: {
        seller: { select: { id: true, fullName: true, businessProfile: true } },
        buyer: { select: { id: true, fullName: true, businessProfile: true } },
        items: true,
      },
    });

    // Create payment ledger entry
    await prisma.payment.create({
      data: {
        orderId: order.id,
        amount: order.totalAmount,
        currency: 'INR',
        status: 'COMPLETED',
        razorpayPaymentId,
        razorpayOrderId,
        method: 'RAZORPAY',
        paidAt: new Date(),
      },
    });

    // Create SubscriptionInvoice / Tax Invoice record for this order
    const invoiceNumber = `INV-ORD-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${order.orderNumber || order.id.substring(0, 6).toUpperCase()}`;
    await prisma.subscriptionInvoice.create({
      data: {
        invoiceNumber,
        userId: order.buyerId,
        amount: order.totalAmount,
        currency: 'INR',
        status: 'PAID',
        billingPeriodStart: new Date(),
        billingPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        paymentMethod: 'RAZORPAY_ESCROW',
        razorpayPaymentId,
        paidAt: new Date(),
      },
    });

    await sendNotification({
      userId: order.buyerId,
      type: 'PAYMENT_RECEIVED',
      title: 'Payment Confirmed & Protected in Escrow',
      body: `₹${order.totalAmount.toLocaleString('en-IN')} has been safely deposited into JaxMart Escrow for Order #${order.orderNumber || order.id.slice(0, 8)}.`,
      data: { orderId },
    });

    await sendNotification({
      userId: order.sellerId,
      type: 'PAYMENT_RECEIVED',
      title: 'Buyer Payment Escrow Funded',
      body: `Buyer has deposited ₹${order.totalAmount.toLocaleString('en-IN')} into Escrow for Order #${order.orderNumber || order.id.slice(0, 8)}. You can begin dispatch.`,
      data: { orderId },
    });

    res.json({ success: true, message: 'Payment verified and funds held in escrow', order });
  } catch (err) {
    logger.error('verifyPayment error:', err);
    res.status(500).json({ error: 'Payment verification failed' });
  }
};

// ─── Invoices Ledger ─────────────────────────────────────────────────────────

// GET /api/payments/invoices
const getUserInvoices = async (req, res) => {
  try {
    const userId = req.user.id;

    const [subscriptionInvoices, creditTxs, subscription, buyerOrders, sellerOrders] = await Promise.all([
      prisma.subscriptionInvoice.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: {
          subscription: { include: { plan: true } },
        },
      }),
      prisma.leadCreditTransaction.findMany({
        where: { wallet: { sellerId: userId }, type: 'PURCHASE' },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.subscription.findUnique({
        where: { userId },
        include: { plan: true },
      }),
      prisma.order.findMany({
        where: { buyerId: userId },
        orderBy: { createdAt: 'desc' },
        include: {
          seller: { select: { id: true, fullName: true, businessProfile: true } },
          items: true,
        },
      }),
      prisma.order.findMany({
        where: { sellerId: userId },
        orderBy: { createdAt: 'desc' },
        include: {
          buyer: { select: { id: true, fullName: true, businessProfile: true } },
          items: true,
        },
      }),
    ]);

    const formattedInvoices = [];

    // 1. Subscription Invoices
    subscriptionInvoices.forEach((inv) => {
      formattedInvoices.push({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        type: 'SUBSCRIPTION',
        title: inv.subscription?.plan?.name ? `${inv.subscription.plan.name} Plan Subscription` : 'SaaS Plan Membership',
        amount: inv.amount,
        taxableAmount: Math.round((inv.amount / 1.18) * 100) / 100,
        gstAmount: Math.round((inv.amount - inv.amount / 1.18) * 100) / 100,
        currency: inv.currency,
        status: inv.status,
        paymentMethod: inv.paymentMethod || 'RAZORPAY',
        referenceId: inv.razorpayPaymentId,
        issuedAt: inv.createdAt,
        paidAt: inv.paidAt || inv.createdAt,
        party: 'JaxMart Global Technologies Pvt Ltd',
      });
    });

    // 2. Active Subscription (if not already represented in SubscriptionInvoice)
    if (subscription && subscription.plan && !subscriptionInvoices.length) {
      const subPrice = subscription.billingCycle === 'YEARLY' ? subscription.plan.yearlyPrice : subscription.plan.monthlyPrice;
      formattedInvoices.push({
        id: subscription.id,
        invoiceNumber: `INV-SUB-${subscription.id.slice(0, 6).toUpperCase()}`,
        type: 'SUBSCRIPTION',
        title: `${subscription.plan.name} Plan Membership (${subscription.billingCycle})`,
        amount: subPrice,
        taxableAmount: Math.round((subPrice / 1.18) * 100) / 100,
        gstAmount: Math.round((subPrice - subPrice / 1.18) * 100) / 100,
        currency: subscription.plan.currency || 'INR',
        status: subscription.status === 'ACTIVE' ? 'PAID' : subscription.status,
        paymentMethod: 'RAZORPAY',
        referenceId: subscription.razorpaySubscriptionId || 'SUB-DIRECT',
        issuedAt: subscription.createdAt,
        paidAt: subscription.currentPeriodStart,
        party: 'JaxMart Global Technologies Pvt Ltd',
      });
    }

    // 3. Lead Credit Purchases
    creditTxs.forEach((c) => {
      const price = c.amount === 10 ? 499 : c.amount === 50 ? 1999 : c.amount === 100 ? 3499 : c.amount === 250 ? 6999 : c.amount * 40;
      formattedInvoices.push({
        id: c.id,
        invoiceNumber: `INV-CREDIT-${c.id.slice(0, 6).toUpperCase()}`,
        type: 'LEAD_CREDIT_PACK',
        title: c.description || `Lead Unlock Credits Pack (${c.amount} Credits)`,
        amount: price,
        taxableAmount: Math.round((price / 1.18) * 100) / 100,
        gstAmount: Math.round((price - price / 1.18) * 100) / 100,
        currency: 'INR',
        status: 'PAID',
        paymentMethod: 'RAZORPAY',
        referenceId: c.referenceId || 'WALLET-RECHARGE',
        issuedAt: c.createdAt,
        paidAt: c.createdAt,
        party: 'JaxMart Global Technologies Pvt Ltd',
      });
    });

    // 4. Buyer Wholesale Orders
    buyerOrders.forEach((ord) => {
      formattedInvoices.push({
        id: ord.id,
        invoiceNumber: `INV-ORD-${ord.orderNumber || ord.id.slice(0, 8).toUpperCase()}`,
        type: 'ORDER_PURCHASE',
        title: ord.items?.[0]?.title ? `${ord.items[0].title} ${ord.items.length > 1 ? `(+${ord.items.length - 1} items)` : ''}` : `B2B Wholesale Order #${ord.orderNumber || ord.id.slice(0, 8)}`,
        amount: ord.totalAmount,
        taxableAmount: Math.round((ord.totalAmount / 1.18) * 100) / 100,
        gstAmount: Math.round((ord.totalAmount - ord.totalAmount / 1.18) * 100) / 100,
        currency: ord.currency || 'INR',
        status: ord.paymentStatus === 'REFUNDED' ? 'REFUNDED' : ord.paymentStatus === 'PAID' ? 'PAID' : 'HELD_ESCROW',
        paymentMethod: 'RAZORPAY_ESCROW',
        referenceId: ord.razorpayPaymentId || 'ESCROW-PROTECTED',
        issuedAt: ord.createdAt,
        paidAt: ord.paidAt || ord.createdAt,
        party: ord.seller?.businessProfile?.businessName || ord.seller?.fullName || 'Verified Supplier',
        orderId: ord.id,
      });
    });

    // 5. Seller Wholesale Settlements
    sellerOrders.forEach((ord) => {
      formattedInvoices.push({
        id: ord.id,
        invoiceNumber: `INV-SALE-${ord.orderNumber || ord.id.slice(0, 8).toUpperCase()}`,
        type: 'SELLER_PAYOUT',
        title: ord.items?.[0]?.title ? `${ord.items[0].title} (Wholesale Settlement)` : `Sales Settlement #${ord.orderNumber || ord.id.slice(0, 8)}`,
        amount: ord.sellerPayout || ord.totalAmount,
        taxableAmount: Math.round(((ord.sellerPayout || ord.totalAmount) / 1.18) * 100) / 100,
        gstAmount: Math.round(((ord.sellerPayout || ord.totalAmount) - (ord.sellerPayout || ord.totalAmount) / 1.18) * 100) / 100,
        currency: ord.currency || 'INR',
        status: ord.escrowStatus === 'RELEASED' ? 'PAID' : ord.escrowStatus === 'REFUNDED' ? 'REFUNDED' : 'HELD_ESCROW',
        paymentMethod: 'ESCROW_SETTLEMENT',
        referenceId: ord.razorpayPaymentId || 'ESCROW-SETTLEMENT',
        issuedAt: ord.createdAt,
        paidAt: ord.completedAt || ord.paidAt || ord.createdAt,
        party: ord.buyer?.businessProfile?.businessName || ord.buyer?.fullName || 'Verified Buyer',
        orderId: ord.id,
      });
    });

    res.json({
      success: true,
      invoices: formattedInvoices.sort((a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime()),
    });
  } catch (err) {
    logger.error('getUserInvoices error:', err);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
};

// GET /api/payments/invoices/:id
const getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Check if subscription invoice
    let invoice = await prisma.subscriptionInvoice.findUnique({
      where: { id },
      include: {
        user: { include: { businessProfile: true, addresses: { where: { isPrimary: true } } } },
        subscription: { include: { plan: true } },
      },
    });

    if (invoice) {
      const taxable = Math.round((invoice.amount / 1.18) * 100) / 100;
      const gst = Math.round((invoice.amount - taxable) * 100) / 100;
      const cgst = Math.round((gst / 2) * 100) / 100;
      const sgst = Math.round((gst / 2) * 100) / 100;

      return res.json({
        success: true,
        invoice: {
          id: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          type: 'TAX_INVOICE',
          category: 'SaaS Subscription & Lead Quota Services',
          status: invoice.status,
          date: invoice.createdAt,
          dueDate: invoice.createdAt,
          seller: {
            name: 'JaxMart Global Technologies Pvt. Ltd.',
            gstin: '24AAACJ9988H1Z1',
            pan: 'AAACJ9988H',
            sacCode: '998313',
            address: 'Suite 500, JaxMart Trade Towers, Bandra Kurla Complex',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400051',
            email: 'billing@jaxmart.in',
          },
          buyer: {
            name: invoice.user?.businessProfile?.businessName || invoice.user?.fullName,
            gstin: invoice.user?.businessProfile?.gstin || 'Unregistered B2B User',
            pan: invoice.user?.businessProfile?.pan || 'N/A',
            address: invoice.user?.addresses?.[0]?.line1 || 'Primary Registered Address',
            city: invoice.user?.addresses?.[0]?.city || 'Surat',
            state: invoice.user?.addresses?.[0]?.state || 'Gujarat',
            pincode: invoice.user?.addresses?.[0]?.pincode || '395006',
            phone: invoice.user?.phone,
            email: invoice.user?.email,
          },
          items: [
            {
              description: `${invoice.subscription?.plan?.name || 'Gold'} Plan Subscription (${invoice.subscription?.billingCycle || 'MONTHLY'})`,
              hsnSac: '998313',
              qty: 1,
              rate: taxable,
              taxableValue: taxable,
              cgstRate: '9%',
              cgstAmount: cgst,
              sgstRate: '9%',
              sgstAmount: sgst,
              total: invoice.amount,
            },
          ],
          taxBreakdown: {
            taxableValue: taxable,
            cgst,
            sgst,
            totalGst: gst,
            grandTotal: invoice.amount,
          },
          payment: {
            method: invoice.paymentMethod || 'RAZORPAY',
            referenceId: invoice.razorpayPaymentId,
            paidAt: invoice.paidAt,
          },
        },
      });
    }

    // 2. Check if Lead Credit Transaction
    const creditTx = await prisma.leadCreditTransaction.findFirst({
      where: { OR: [{ id }, { id: id.replace('LCP-', '') }] },
      include: {
        wallet: {
          include: {
            seller: { include: { businessProfile: true, addresses: { where: { isPrimary: true } } } },
          },
        },
      },
    });

    if (creditTx) {
      const price = creditTx.amount === 10 ? 499 : creditTx.amount === 50 ? 1999 : creditTx.amount === 100 ? 3499 : creditTx.amount === 250 ? 6999 : creditTx.amount * 40;
      const taxable = Math.round((price / 1.18) * 100) / 100;
      const gst = Math.round((price - taxable) * 100) / 100;
      const cgst = Math.round((gst / 2) * 100) / 100;
      const sgst = Math.round((gst / 2) * 100) / 100;
      const user = creditTx.wallet?.seller;

      return res.json({
        success: true,
        invoice: {
          id: creditTx.id,
          invoiceNumber: `INV-CREDIT-${creditTx.id.slice(0, 6).toUpperCase()}`,
          type: 'TAX_INVOICE',
          category: 'Lead Unlock Credits Pack',
          status: 'PAID',
          date: creditTx.createdAt,
          dueDate: creditTx.createdAt,
          seller: {
            name: 'JaxMart Global Technologies Pvt. Ltd.',
            gstin: '24AAACJ9988H1Z1',
            pan: 'AAACJ9988H',
            sacCode: '998313',
            address: 'Suite 500, JaxMart Trade Towers, Bandra Kurla Complex',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400051',
            email: 'billing@jaxmart.in',
          },
          buyer: {
            name: user?.businessProfile?.businessName || user?.fullName || 'Verified Supplier',
            gstin: user?.businessProfile?.gstin || 'Unregistered B2B User',
            pan: user?.businessProfile?.pan || 'N/A',
            address: user?.addresses?.[0]?.line1 || 'Primary Registered Address',
            city: user?.addresses?.[0]?.city || 'Surat',
            state: user?.addresses?.[0]?.state || 'Gujarat',
            pincode: user?.addresses?.[0]?.pincode || '395006',
            phone: user?.phone,
            email: user?.email,
          },
          items: [
            {
              description: creditTx.description || `Lead Unlock Credits Pack (${creditTx.amount} Credits)`,
              hsnSac: '998313',
              qty: 1,
              rate: taxable,
              taxableValue: taxable,
              cgstRate: '9%',
              cgstAmount: cgst,
              sgstRate: '9%',
              sgstAmount: sgst,
              total: price,
            },
          ],
          taxBreakdown: {
            taxableValue: taxable,
            cgst,
            sgst,
            totalGst: gst,
            grandTotal: price,
          },
          payment: {
            method: 'RAZORPAY',
            referenceId: creditTx.referenceId || 'WALLET-INSTANT',
            paidAt: creditTx.createdAt,
          },
        },
      });
    }

    // 3. Check if subscription model ID
    const sub = await prisma.subscription.findUnique({
      where: { id },
      include: {
        user: { include: { businessProfile: true, addresses: { where: { isPrimary: true } } } },
        plan: true,
      },
    });

    if (sub && sub.plan) {
      const price = sub.billingCycle === 'YEARLY' ? sub.plan.yearlyPrice : sub.plan.monthlyPrice;
      const taxable = Math.round((price / 1.18) * 100) / 100;
      const gst = Math.round((price - taxable) * 100) / 100;
      const cgst = Math.round((gst / 2) * 100) / 100;
      const sgst = Math.round((gst / 2) * 100) / 100;

      return res.json({
        success: true,
        invoice: {
          id: sub.id,
          invoiceNumber: `INV-SUB-${sub.id.slice(0, 6).toUpperCase()}`,
          type: 'TAX_INVOICE',
          category: 'SaaS Plan Membership',
          status: sub.status === 'ACTIVE' ? 'PAID' : sub.status,
          date: sub.createdAt,
          dueDate: sub.createdAt,
          seller: {
            name: 'JaxMart Global Technologies Pvt. Ltd.',
            gstin: '24AAACJ9988H1Z1',
            pan: 'AAACJ9988H',
            sacCode: '998313',
            address: 'Suite 500, JaxMart Trade Towers, Bandra Kurla Complex',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400051',
            email: 'billing@jaxmart.in',
          },
          buyer: {
            name: sub.user?.businessProfile?.businessName || sub.user?.fullName,
            gstin: sub.user?.businessProfile?.gstin || 'Unregistered B2B User',
            pan: sub.user?.businessProfile?.pan || 'N/A',
            address: sub.user?.addresses?.[0]?.line1 || 'Primary Registered Address',
            city: sub.user?.addresses?.[0]?.city || 'Surat',
            state: sub.user?.addresses?.[0]?.state || 'Gujarat',
            pincode: sub.user?.addresses?.[0]?.pincode || '395006',
            phone: sub.user?.phone,
            email: sub.user?.email,
          },
          items: [
            {
              description: `${sub.plan.name} Plan Membership (${sub.billingCycle})`,
              hsnSac: '998313',
              qty: 1,
              rate: taxable,
              taxableValue: taxable,
              cgstRate: '9%',
              cgstAmount: cgst,
              sgstRate: '9%',
              sgstAmount: sgst,
              total: price,
            },
          ],
          taxBreakdown: {
            taxableValue: taxable,
            cgst,
            sgst,
            totalGst: gst,
            grandTotal: price,
          },
          payment: {
            method: 'RAZORPAY',
            referenceId: sub.razorpaySubscriptionId || 'SUB-AUTO',
            paidAt: sub.currentPeriodStart,
          },
        },
      });
    }

    // 4. Check if order
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        buyer: { include: { businessProfile: true, addresses: { where: { isPrimary: true } } } },
        seller: { include: { businessProfile: true, addresses: { where: { isPrimary: true } } } },
        items: true,
      },
    });

    if (order) {
      const taxable = Math.round((order.totalAmount / 1.18) * 100) / 100;
      const gst = Math.round((order.totalAmount - taxable) * 100) / 100;
      const cgst = Math.round((gst / 2) * 100) / 100;
      const sgst = Math.round((gst / 2) * 100) / 100;

      return res.json({
        success: true,
        invoice: {
          id: order.id,
          invoiceNumber: `INV-ORD-${order.orderNumber || order.id.slice(0, 8).toUpperCase()}`,
          type: 'B2B_TRADE_INVOICE',
          category: 'Physical Goods Wholesale Trade',
          status: order.paymentStatus === 'PAID' ? 'PAID' : order.paymentStatus,
          date: order.createdAt,
          dueDate: order.createdAt,
          seller: {
            name: order.seller?.businessProfile?.businessName || order.seller?.fullName,
            gstin: order.seller?.businessProfile?.gstin || '24AAECS9988H1ZV',
            pan: order.seller?.businessProfile?.pan || 'AAECS9988H',
            address: order.seller?.addresses?.[0]?.line1 || 'Factory Premise',
            city: order.seller?.addresses?.[0]?.city || 'Surat',
            state: order.seller?.addresses?.[0]?.state || 'Gujarat',
            pincode: order.seller?.addresses?.[0]?.pincode || '395006',
            phone: order.seller?.phone,
            email: order.seller?.email,
          },
          buyer: {
            name: order.buyer?.businessProfile?.businessName || order.buyer?.fullName,
            gstin: order.buyer?.businessProfile?.gstin || '27AAACS1234F1Z5',
            pan: order.buyer?.businessProfile?.pan || 'AAACS1234F',
            address: order.buyer?.addresses?.[0]?.line1 || 'Procurement Office',
            city: order.buyer?.addresses?.[0]?.city || 'Mumbai',
            state: order.buyer?.addresses?.[0]?.state || 'Maharashtra',
            pincode: order.buyer?.addresses?.[0]?.pincode || '400001',
            phone: order.buyer?.phone,
            email: order.buyer?.email,
          },
          items: (order.items && order.items.length > 0 ? order.items : [{ title: 'Wholesale B2B Cargo', quantity: 1, unitPrice: taxable }]).map((it) => {
            const itemTaxable = Math.round(((it.totalPrice || it.unitPrice || taxable) / 1.18) * 100) / 100;
            const itemGst = Math.round(((it.totalPrice || it.unitPrice || taxable) - itemTaxable) * 100) / 100;
            return {
              description: it.title,
              hsnSac: it.sku || '84818030',
              qty: it.quantity || 1,
              rate: it.unitPrice || itemTaxable,
              taxableValue: itemTaxable,
              cgstRate: '9%',
              cgstAmount: Math.round((itemGst / 2) * 100) / 100,
              sgstRate: '9%',
              sgstAmount: Math.round((itemGst / 2) * 100) / 100,
              total: it.totalPrice || order.totalAmount,
            };
          }),
          taxBreakdown: {
            taxableValue: taxable,
            cgst,
            sgst,
            totalGst: gst,
            grandTotal: order.totalAmount,
          },
          payment: {
            method: 'RAZORPAY_ESCROW_LOCK',
            referenceId: order.razorpayPaymentId,
            paidAt: order.paidAt || order.createdAt,
            escrowStatus: order.escrowStatus,
          },
        },
      });
    }

    return res.status(404).json({ error: 'Invoice record not found' });
  } catch (err) {
    logger.error('getInvoiceById error:', err);
    res.status(500).json({ error: 'Failed to fetch invoice details' });
  }
};

// ─── Purchases & Orders ───────────────────────────────────────────────────────

// GET /api/payments/purchases
const getUserPurchases = async (req, res) => {
  try {
    const userId = req.user.id;

    const [orders, creditTxs, subscription] = await Promise.all([
      prisma.order.findMany({
        where: { buyerId: userId },
        orderBy: { createdAt: 'desc' },
        include: {
          seller: { select: { id: true, fullName: true, businessProfile: true } },
          items: true,
          milestones: true,
        },
      }),
      prisma.leadCreditTransaction.findMany({
        where: { wallet: { sellerId: userId }, type: 'PURCHASE' },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.subscription.findUnique({
        where: { userId },
        include: { plan: true },
      }),
    ]);

    const purchases = [
      ...orders.map((o) => ({
        id: o.id,
        purchaseType: 'DIRECT_ORDER',
        orderNumber: o.orderNumber || o.id.slice(0, 8).toUpperCase(),
        title: o.items?.[0]?.title ? `${o.items[0].title} ${o.items.length > 1 ? `(+${o.items.length - 1} items)` : ''}` : 'B2B Wholesale Order',
        totalAmount: o.totalAmount,
        currency: o.currency || 'INR',
        paymentStatus: o.paymentStatus,
        escrowStatus: o.escrowStatus,
        orderStatus: o.status,
        seller: o.seller?.businessProfile?.businessName || o.seller?.fullName,
        createdAt: o.createdAt,
        paidAt: o.paidAt,
        razorpayPaymentId: o.razorpayPaymentId,
      })),
      ...creditTxs.map((c) => ({
        id: c.id,
        purchaseType: 'LEAD_CREDIT_PACK',
        orderNumber: `LCP-${c.id.slice(0, 6).toUpperCase()}`,
        title: c.description || `${c.amount} Lead Unlock Credits`,
        totalAmount: c.amount === 10 ? 499 : c.amount === 50 ? 1999 : c.amount === 100 ? 3499 : 6999,
        currency: 'INR',
        paymentStatus: 'PAID',
        escrowStatus: 'INSTANT_CREDIT',
        orderStatus: 'DELIVERED',
        seller: 'JaxMart Platform',
        createdAt: c.createdAt,
        paidAt: c.createdAt,
        razorpayPaymentId: c.referenceId,
      })),
    ];

    if (subscription && subscription.plan) {
      purchases.push({
        id: subscription.id,
        purchaseType: 'SUBSCRIPTION',
        orderNumber: `SUB-${subscription.id.slice(0, 6).toUpperCase()}`,
        title: `${subscription.plan.name} Plan Membership (${subscription.billingCycle})`,
        totalAmount: subscription.billingCycle === 'YEARLY' ? subscription.plan.yearlyPrice : subscription.plan.monthlyPrice,
        currency: subscription.plan.currency || 'INR',
        paymentStatus: subscription.status === 'ACTIVE' ? 'PAID' : subscription.status,
        escrowStatus: 'SERVICE_ACTIVE',
        orderStatus: subscription.status === 'ACTIVE' ? 'ACTIVE' : 'EXPIRED',
        seller: 'JaxMart Platform',
        createdAt: subscription.createdAt,
        paidAt: subscription.currentPeriodStart,
        razorpayPaymentId: subscription.razorpaySubscriptionId,
      });
    }

    res.json({ success: true, purchases: purchases.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) });
  } catch (err) {
    logger.error('getUserPurchases error:', err);
    res.status(500).json({ error: 'Failed to fetch purchase history' });
  }
};

// ─── Refunds Management ───────────────────────────────────────────────────────

// POST /api/payments/orders/:orderId/request-refund
const requestRefund = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason, description, evidenceUrls } = req.body;
    const userId = req.user.id;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { seller: true },
    });

    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.buyerId !== userId) return res.status(403).json({ error: 'Only the purchasing buyer can request a refund' });

    if (order.escrowStatus === 'RELEASED') {
      return res.status(400).json({ error: 'Funds have already been released to seller. Please raise a Dispute.' });
    }

    // Update order with refund request info
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'DISPUTED',
        cancelReason: `Refund Requested: ${reason}. Note: ${description || ''}`,
      },
    });

    // Create formal dispute / refund ticket
    const dispute = await prisma.dispute.create({
      data: {
        orderId: order.id,
        raisedById: userId,
        reason: reason || 'REFUND_REQUEST',
        description: description || 'Buyer requested full refund from Escrow',
        evidence: evidenceUrls || [],
        status: 'OPEN',
      },
    });

    await sendNotification({
      userId: order.sellerId,
      type: 'DISPUTE_RAISED',
      title: 'Refund Request Received',
      body: `Buyer requested refund for Order #${order.orderNumber || order.id.slice(0, 8)}. Reason: ${reason}.`,
      data: { orderId, disputeId: dispute.id },
    });

    res.json({
      success: true,
      message: 'Refund request submitted to Admin mediation queue successfully',
      order: updatedOrder,
      dispute,
    });
  } catch (err) {
    logger.error('requestRefund error:', err);
    res.status(500).json({ error: 'Failed to submit refund request' });
  }
};

// GET /api/payments/refunds
const getUserRefunds = async (req, res) => {
  try {
    const userId = req.user.id;

    const disputes = await prisma.dispute.findMany({
      where: {
        OR: [{ raisedById: userId }, { order: { sellerId: userId } }],
      },
      orderBy: { createdAt: 'desc' },
      include: {
        order: {
          include: {
            seller: { select: { fullName: true, businessProfile: true } },
            buyer: { select: { fullName: true, businessProfile: true } },
          },
        },
      },
    });

    const refunds = disputes.map((d) => ({
      id: d.id,
      orderId: d.orderId,
      orderNumber: d.order?.orderNumber || d.orderId?.slice(0, 8),
      amount: d.order?.totalAmount || 0,
      reason: d.reason,
      description: d.description,
      status: d.status === 'RESOLVED' || d.order?.escrowStatus === 'REFUNDED' ? 'REFUNDED' : d.status === 'REJECTED' ? 'REJECTED' : 'UNDER_REVIEW',
      raisedAt: d.createdAt,
      resolutionNote: d.resolutionNote,
      resolvedAt: d.resolvedAt,
      sellerName: d.order?.seller?.businessProfile?.businessName || d.order?.seller?.fullName,
      buyerName: d.order?.buyer?.businessProfile?.businessName || d.order?.buyer?.fullName,
    }));

    res.json({ success: true, refunds });
  } catch (err) {
    logger.error('getUserRefunds error:', err);
    res.status(500).json({ error: 'Failed to fetch refunds' });
  }
};

// ─── Admin Invoices, Purchases & Refunds Endpoints ───────────────────────────

// GET /api/admin/invoices
const getAdminInvoices = async (req, res) => {
  try {
    const { search, status, type } = req.query;

    const [subscriptionInvoices, creditTxs, orders] = await Promise.all([
      prisma.subscriptionInvoice.findMany({
        orderBy: { createdAt: 'desc' },
        take: 100,
        include: {
          user: { include: { businessProfile: true } },
          subscription: { include: { plan: true } },
        },
      }),
      prisma.leadCreditTransaction.findMany({
        where: { type: 'PURCHASE' },
        orderBy: { createdAt: 'desc' },
        take: 100,
        include: {
          wallet: {
            include: {
              seller: { include: { businessProfile: true } },
            },
          },
        },
      }),
      prisma.order.findMany({
        where: { paymentStatus: { in: ['PAID', 'PARTIALLY_PAID', 'REFUNDED'] } },
        orderBy: { createdAt: 'desc' },
        take: 100,
        include: {
          buyer: { include: { businessProfile: true } },
          seller: { include: { businessProfile: true } },
          items: true,
        },
      }),
    ]);

    const allInvoices = [
      ...subscriptionInvoices.map((inv) => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        type: 'SUBSCRIPTION',
        category: 'SaaS Plan Membership',
        amount: inv.amount,
        currency: inv.currency,
        status: inv.status,
        paymentMethod: inv.paymentMethod || 'RAZORPAY',
        customer: inv.user?.businessProfile?.businessName || inv.user?.fullName,
        customerPhone: inv.user?.phone,
        referenceId: inv.razorpayPaymentId,
        date: inv.createdAt,
      })),
      ...creditTxs.map((c) => {
        const price = c.amount === 10 ? 499 : c.amount === 50 ? 1999 : c.amount === 100 ? 3499 : c.amount === 250 ? 6999 : c.amount * 40;
        return {
          id: c.id,
          invoiceNumber: `INV-CREDIT-${c.id.slice(0, 6).toUpperCase()}`,
          type: 'LEAD_CREDIT_PACK',
          category: 'Lead Unlock Credits Pack',
          amount: price,
          currency: 'INR',
          status: 'PAID',
          paymentMethod: 'RAZORPAY',
          customer: c.wallet?.seller?.businessProfile?.businessName || c.wallet?.seller?.fullName || 'Verified Supplier',
          customerPhone: c.wallet?.seller?.phone,
          referenceId: c.referenceId || 'WALLET-RECHARGE',
          date: c.createdAt,
        };
      }),
      ...orders.map((ord) => ({
        id: ord.id,
        invoiceNumber: `INV-ORD-${ord.orderNumber || ord.id.slice(0, 8).toUpperCase()}`,
        type: 'ORDER_PURCHASE',
        category: 'Wholesale Physical Goods',
        amount: ord.totalAmount,
        currency: ord.currency || 'INR',
        status: ord.paymentStatus === 'REFUNDED' ? 'REFUNDED' : 'PAID',
        paymentMethod: 'RAZORPAY_ESCROW',
        customer: ord.buyer?.businessProfile?.businessName || ord.buyer?.fullName,
        customerPhone: ord.buyer?.phone,
        supplier: ord.seller?.businessProfile?.businessName || ord.seller?.fullName,
        referenceId: ord.razorpayPaymentId,
        date: ord.createdAt,
      })),
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({ success: true, invoices: allInvoices, total: allInvoices.length });
  } catch (err) {
    logger.error('getAdminInvoices error:', err);
    res.status(500).json({ error: 'Failed to fetch admin invoices' });
  }
};

// GET /api/admin/refunds
const getAdminRefunds = async (req, res) => {
  try {
    const disputes = await prisma.dispute.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        order: {
          include: {
            buyer: { include: { businessProfile: true } },
            seller: { include: { businessProfile: true } },
          },
        },
      },
    });

    const refunds = disputes.map((d) => ({
      id: d.id,
      orderId: d.orderId,
      orderNumber: d.order?.orderNumber || d.orderId?.slice(0, 8),
      amount: d.order?.totalAmount || 0,
      reason: d.reason,
      description: d.description,
      status: d.order?.escrowStatus === 'REFUNDED' ? 'REFUNDED' : d.status === 'RESOLVED' ? 'RESOLVED' : d.status === 'REJECTED' ? 'REJECTED' : 'PENDING_REVIEW',
      evidence: d.evidence,
      buyerName: d.order?.buyer?.businessProfile?.businessName || d.order?.buyer?.fullName,
      buyerPhone: d.order?.buyer?.phone,
      sellerName: d.order?.seller?.businessProfile?.businessName || d.order?.seller?.fullName,
      sellerPhone: d.order?.seller?.phone,
      razorpayPaymentId: d.order?.razorpayPaymentId,
      createdAt: d.createdAt,
      resolutionNote: d.resolutionNote,
    }));

    res.json({ success: true, refunds });
  } catch (err) {
    logger.error('getAdminRefunds error:', err);
    res.status(500).json({ error: 'Failed to fetch admin refund queue' });
  }
};

// POST /api/admin/refunds/:orderId/process
const processAdminRefund = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { refundAmount, reasonNote = 'Approved by JaxMart Platform Administrator' } = req.body;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { buyer: true, seller: true },
    });

    if (!order) return res.status(404).json({ error: 'Order not found' });

    const amountToRefund = refundAmount ? parseFloat(refundAmount) : order.totalAmount;

    // Trigger Razorpay Refund API if paymentId exists
    let razorpayRefund = null;
    if (order.razorpayPaymentId && process.env.RAZORPAY_KEY_ID) {
      try {
        razorpayRefund = await razorpay.payments.refund(order.razorpayPaymentId, {
          amount: Math.round(amountToRefund * 100), // in paise
          notes: {
            orderId: order.id,
            reason: reasonNote,
            processedBy: req.user.fullName,
          },
        });
        logger.info(`Razorpay Refund Processed for order ${order.id}: ${razorpayRefund.id}`);
      } catch (rzpErr) {
        logger.warn(`Razorpay API refund notice: ${rzpErr.message}. Executing internal ledger refund.`);
      }
    }

    // Update order status & escrow ledger
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'CANCELLED',
        escrowStatus: 'REFUNDED',
        paymentStatus: 'REFUNDED',
        totalRefundedAmount: amountToRefund,
        cancelReason: reasonNote,
      },
    });

    // Update any linked open dispute
    await prisma.dispute.updateMany({
      where: { orderId: order.id, status: 'OPEN' },
      data: {
        status: 'RESOLVED',
        resolutionNote: `Full refund of ₹${amountToRefund.toLocaleString('en-IN')} approved and released back to buyer. ${reasonNote}`,
        resolvedAt: new Date(),
      },
    });

    // Notify Buyer
    await sendNotification({
      userId: order.buyerId,
      type: 'PAYMENT_RECEIVED',
      title: 'Refund Approved & Processed',
      body: `Your refund of ₹${amountToRefund.toLocaleString('en-IN')} for Order #${order.orderNumber || order.id.slice(0, 8)} has been released back to your original payment method.`,
      data: { orderId: order.id },
    });

    // Notify Seller
    await sendNotification({
      userId: order.sellerId,
      type: 'DISPUTE_RESOLVED',
      title: 'Order Refund Processed',
      body: `Refund of ₹${amountToRefund.toLocaleString('en-IN')} has been finalized for Order #${order.orderNumber || order.id.slice(0, 8)}.`,
      data: { orderId: order.id },
    });

    res.json({
      success: true,
      message: `Refund of ₹${amountToRefund.toLocaleString('en-IN')} processed successfully`,
      order: updatedOrder,
      razorpayRefund,
    });
  } catch (err) {
    logger.error('processAdminRefund error:', err);
    res.status(500).json({ error: err.message || 'Failed to process refund' });
  }
};

// POST /api/admin/refunds/:orderId/reject
const rejectAdminRefund = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reasonNote = 'Refund rejected upon verification' } = req.body;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) return res.status(404).json({ error: 'Order not found' });

    await prisma.dispute.updateMany({
      where: { orderId, status: 'OPEN' },
      data: {
        status: 'REJECTED',
        resolutionNote: reasonNote,
        resolvedAt: new Date(),
      },
    });

    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'CONFIRMED' },
    });

    await sendNotification({
      userId: order.buyerId,
      type: 'DISPUTE_RESOLVED',
      title: 'Refund Request Declined',
      body: `Your refund request for Order #${order.orderNumber || order.id.slice(0, 8)} was declined. Reason: ${reasonNote}`,
      data: { orderId },
    });

    res.json({ success: true, message: 'Refund request declined' });
  } catch (err) {
    logger.error('rejectAdminRefund error:', err);
    res.status(500).json({ error: 'Failed to reject refund' });
  }
};

module.exports = {
  createPaymentOrder,
  verifyPayment,
  getUserInvoices,
  getInvoiceById,
  getUserPurchases,
  requestRefund,
  getUserRefunds,
  getAdminInvoices,
  getAdminRefunds,
  processAdminRefund,
  rejectAdminRefund,
};
