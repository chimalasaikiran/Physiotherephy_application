import React, { useState } from 'react';
import { MOCK_TRANSACTIONS } from '../mockData';
import { ArrowUpRight, ArrowDownLeft, RotateCcw, Filter } from 'lucide-react';

export const TransactionsTabView: React.FC = () => {
  const [typeFilter, setTypeFilter] = useState('All');

  const filteredTransactions = MOCK_TRANSACTIONS.filter((txn) => {
    return typeFilter === 'All' || txn.type === typeFilter;
  });

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">
            Transaction History
          </h3>
          <p className="text-xs text-slate-400 font-medium">
            Real-time log of payments, payouts, and refund processed.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 text-xs font-semibold text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-transparent font-bold text-slate-900 focus:outline-none cursor-pointer"
            >
              <option value="All">All Types</option>
              <option value="Payment">Payments</option>
              <option value="Payout">Payouts</option>
              <option value="Refund">Refunds</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              <th className="py-3 px-4">Transaction ID</th>
              <th className="py-3 px-4">Entity / Patient</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Method</th>
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4">Amount</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 text-xs font-medium text-slate-700">
            {filteredTransactions.map((txn) => (
              <tr key={txn.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                  {txn.transactionId}
                </td>
                <td className="py-3.5 px-4 font-bold text-slate-900">
                  {txn.patientName}
                </td>
                <td className="py-3.5 px-4">
                  <span className="inline-flex items-center text-xs font-bold space-x-1">
                    {txn.type === 'Payment' && (
                      <>
                        <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-emerald-600">Payment</span>
                      </>
                    )}
                    {txn.type === 'Payout' && (
                      <>
                        <ArrowUpRight className="w-3.5 h-3.5 text-blue-500" />
                        <span className="text-blue-600">Payout</span>
                      </>
                    )}
                    {txn.type === 'Refund' && (
                      <>
                        <RotateCcw className="w-3.5 h-3.5 text-rose-500" />
                        <span className="text-rose-600">Refund</span>
                      </>
                    )}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-slate-500">{txn.method}</td>
                <td className="py-3.5 px-4 text-slate-400">{txn.timestamp}</td>
                <td className="py-3.5 px-4 font-extrabold text-slate-900">
                  ₹{txn.amount.toLocaleString('en-IN')}
                </td>
                <td className="py-3.5 px-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      txn.status === 'Completed'
                        ? 'bg-emerald-50 text-emerald-600'
                        : txn.status === 'Failed'
                        ? 'bg-rose-50 text-rose-600'
                        : 'bg-blue-50 text-blue-600'
                    }`}
                  >
                    {txn.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
