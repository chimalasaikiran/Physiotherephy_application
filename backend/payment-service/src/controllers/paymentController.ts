import { Request, Response } from 'express';
import { PaymentService } from '../services/paymentService.js';

export class PaymentController {
  static async processPayment(req: Request, res: Response): Promise<void> {
    try {
      const body = req.body;
      if (!body.bookingId || !body.amount) {
        res.status(400).json({
          success: false,
          error: 'Missing required payment parameters (bookingId, amount).',
        });
        return;
      }

      const result = await PaymentService.processPayment({
        id: body.id,
        bookingId: body.bookingId,
        userId: body.userId || 'user_demo_123',
        patientName: body.patientName || 'Patient',
        therapistId: body.therapistId,
        therapistName: body.therapistName,
        amount: Number(body.amount),
        currency: body.currency || 'INR',
        paymentMode: body.paymentMode || 'online',
        paymentMethodName: body.paymentMethodName || 'UPI',
        invoiceNumber: body.invoiceNumber,
        status: body.status || 'Paid',
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error('PaymentController.processPayment Error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to process payment.',
        message: error.message,
      });
    }
  }

  static async getUserPayments(req: Request, res: Response): Promise<void> {
    try {
      const rawUserId = req.params.userId;
      const userId = Array.isArray(rawUserId) ? rawUserId[0]! : String(rawUserId);
      const payments = await PaymentService.getUserPayments(userId);
      res.status(200).json({
        success: true,
        data: payments,
      });
    } catch (error: any) {
      console.error('PaymentController.getUserPayments Error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch user payments.',
        message: error.message,
      });
    }
  }

  static async getAllPayments(_req: Request, res: Response): Promise<void> {
    try {
      const payments = await PaymentService.getAllPayments();
      res.status(200).json({ success: true, data: payments });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getInvoice(req: Request, res: Response): Promise<void> {
    try {
      const rawId = req.params.id;
      const invoiceId = Array.isArray(rawId) ? rawId[0]! : String(rawId);
      const invoice = await PaymentService.getInvoiceDetails(invoiceId);
      if (!invoice) {
        res.status(404).json({
          success: false,
          error: 'Invoice not found.',
        });
        return;
      }
      res.status(200).json({
        success: true,
        data: invoice,
      });
    } catch (error: any) {
      console.error('PaymentController.getInvoice Error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch invoice details.',
        message: error.message,
      });
    }
  }

  static async getInvoices(req: Request, res: Response): Promise<void> {
    try {
      const patientId = req.query.patientId as string | undefined;
      const invoices = await PaymentService.getAllInvoices(patientId);
      res.status(200).json({ success: true, data: invoices });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async createInvoice(req: Request, res: Response): Promise<void> {
    try {
      const invoice = await PaymentService.createInvoice(req.body);
      res.status(201).json({ success: true, data: invoice });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async updateInvoice(req: Request, res: Response): Promise<void> {
    try {
      const rawId = req.params.id;
      const id = Array.isArray(rawId) ? rawId[0]! : String(rawId);
      await PaymentService.updateInvoice(id, req.body);
      res.status(200).json({ success: true, message: 'Invoice updated' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async deleteInvoice(req: Request, res: Response): Promise<void> {
    try {
      const rawId = req.params.id;
      const id = Array.isArray(rawId) ? rawId[0]! : String(rawId);
      await PaymentService.deleteInvoice(id);
      res.status(200).json({ success: true, message: 'Invoice deleted' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getTransactions(_req: Request, res: Response): Promise<void> {
    try {
      const txns = await PaymentService.getAllTransactions();
      res.status(200).json({ success: true, data: txns });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getPackages(_req: Request, res: Response): Promise<void> {
    try {
      const pkgs = await PaymentService.getAllPackages();
      res.status(200).json({ success: true, data: pkgs });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async createPackage(req: Request, res: Response): Promise<void> {
    try {
      const pkg = await PaymentService.createPackage(req.body);
      res.status(201).json({ success: true, data: pkg });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getRefunds(_req: Request, res: Response): Promise<void> {
    try {
      const refunds = await PaymentService.getAllRefunds();
      res.status(200).json({ success: true, data: refunds });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async processRefund(req: Request, res: Response): Promise<void> {
    try {
      const {
        paymentId,
        bookingId,
        appointmentId,
        refundAmount,
        refundReason,
        processedBy,
        paymentProvider,
      } = req.body;

      const targetId = paymentId || bookingId || appointmentId;
      if (!targetId || refundAmount === undefined || refundAmount === null) {
        res.status(400).json({
          success: false,
          error: 'Missing required parameters (paymentId, bookingId, or appointmentId, and refundAmount).',
        });
        return;
      }

      const result = await PaymentService.processRefund({
        paymentId,
        bookingId,
        appointmentId,
        refundAmount: Number(refundAmount),
        refundReason,
        processedBy,
        paymentProvider,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error('PaymentController.processRefund Error:', error);
      res.status(400).json({
        success: false,
        error: 'Failed to process refund.',
        message: error.message,
      });
    }
  }

  static async getPayouts(_req: Request, res: Response): Promise<void> {
    try {
      const payouts = await PaymentService.getAllPayouts();
      res.status(200).json({ success: true, data: payouts });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async createPayout(req: Request, res: Response): Promise<void> {
    try {
      const payout = await PaymentService.createPayout(req.body);
      res.status(201).json({ success: true, data: payout });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

