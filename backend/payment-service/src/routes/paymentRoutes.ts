import { Router } from 'express';
import { PaymentController } from '../controllers/paymentController.js';

const router = Router();

// Process & Fetch payments
router.post('/process', PaymentController.processPayment);
router.get('/user/:userId', PaymentController.getUserPayments);
router.get('/all', PaymentController.getAllPayments);

// Invoices
router.get('/invoices', PaymentController.getInvoices);
router.get('/invoice/:id', PaymentController.getInvoice);
router.post('/invoices', PaymentController.createInvoice);
router.put('/invoices/:id', PaymentController.updateInvoice);
router.delete('/invoices/:id', PaymentController.deleteInvoice);

// Transactions
router.get('/transactions', PaymentController.getTransactions);

// Packages
router.get('/packages', PaymentController.getPackages);
router.post('/packages', PaymentController.createPackage);

// Refunds
router.get('/refunds', PaymentController.getRefunds);
router.post('/refund', PaymentController.processRefund);

// Payouts
router.get('/payouts', PaymentController.getPayouts);
router.post('/payouts', PaymentController.createPayout);

export default router;

