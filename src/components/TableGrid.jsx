import React from 'react';
import TableCard from './TableCard';
import { TABLES_DATA } from '../constants/data';

const TableGrid = ({ onBookNow }) => {
  return (
    <section id="tables" className="tables-section" style={{ backgroundColor: 'var(--dark)' }}>
      <div className="container">
        <div className="section-head" style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div>
              <h2 className="section-title font-bold text-white">Available Tables</h2>
              <div className="section-divider" style={{ margin: '0' }}></div>
            </div>
            
            <div className="glass-card" style={{ display: 'flex', padding: '0.25rem', borderRadius: '12px' }}>
              <button className="btn" style={{ padding: '0.5rem 1.5rem', backgroundColor: 'var(--primary)', fontSize: '0.875rem' }}>All Tables</button>
              <button className="btn" style={{ padding: '0.5rem 1.5rem', backgroundColor: 'transparent', color: 'var(--gray-400)', fontSize: '0.875rem' }}>Small</button>
              <button className="btn" style={{ padding: '0.5rem 1.5rem', backgroundColor: 'transparent', color: 'var(--gray-400)', fontSize: '0.875rem' }}>Big</button>
            </div>
          </div>
        </div>

        <div className="tables-grid">
          {TABLES_DATA.map((table) => (
            <TableCard 
              key={table.id} 
              table={table} 
              onBookNow={onBookNow}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TableGrid;
