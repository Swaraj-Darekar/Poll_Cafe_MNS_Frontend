import React from 'react';
import './ProfitTable.css';

const ProfitTable = ({ data = [] }) => {


  return (
    <div className="profit-table-card">
      <h3 className="profit-table-title">Monthly Profit & Loss</h3>
      <div className="table-responsive">
        <table className="profit-table">
          <thead>
            <tr>
              <th>Month</th>
              <th className="align-right">Total Sales (₹)</th>
              <th className="align-right">Expenditure (₹)</th>
              <th className="align-right">Net Profit (₹)</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index}>
                <td className="font-medium">{row.month}</td>
                <td className="align-right">₹{row.sales.toLocaleString()}</td>
                <td className="align-right text-expense">₹{row.expense.toLocaleString()}</td>
                <td className={`align-right font-bold ${row.profit >= 0 ? 'text-profit' : 'text-loss'}`}>
                  {row.profit >= 0 ? '+' : '-'}₹{Math.abs(row.profit).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProfitTable;
