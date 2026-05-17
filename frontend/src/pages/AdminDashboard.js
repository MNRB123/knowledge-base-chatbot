import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { MessageSquare, FileText, Users, Star, TrendingUp, Clock } from 'lucide-react';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/admin/stats').then(res => {
      setStats(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="admin-page">
      <div className="loading-state">Loading analytics...</div>
    </div>
  );

  if (!stats) return <div className="admin-page"><div className="empty-state">Failed to load stats.</div></div>;

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>Analytics Dashboard</h1>
        <p>Monitor chatbot performance and usage</p>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        {[
          { label: 'Total Queries', value: stats.stats.totalQueries, icon: MessageSquare, color: 'indigo' },
          { label: 'Documents', value: stats.stats.totalDocuments, icon: FileText, color: 'green' },
          { label: 'Users', value: stats.stats.totalUsers, icon: Users, color: 'amber' },
          { label: 'Avg Rating', value: stats.stats.avgRating, icon: Star, color: 'purple' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className={`stat-card ${color}`}>
            <div className="stat-icon"><Icon size={20} /></div>
            <div className="stat-info">
              <p className="stat-label">{label}</p>
              <h3 className="stat-value">{value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="charts-row">
        {/* Query Trend Chart */}
        <div className="chart-card wide">
          <h2><TrendingUp size={16} /> Query Trend (Last 30 Days)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats.queryTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="_id" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8 }} />
              <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Breakdown */}
        <div className="chart-card">
          <h2>Document Categories</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={stats.categoryBreakdown} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={80} label={({ _id, count }) => `${_id}: ${count}`}>
                {stats.categoryBreakdown.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="tables-row">
        {/* Top Documents */}
        <div className="table-card">
          <h2><FileText size={16} /> Most Queried Documents</h2>
          <table className="data-table">
            <thead>
              <tr><th>Title</th><th>Type</th><th>Category</th><th>Queries</th></tr>
            </thead>
            <tbody>
              {stats.topDocuments.map(doc => (
                <tr key={doc._id}>
                  <td>{doc.title}</td>
                  <td><span className="badge">{doc.fileType}</span></td>
                  <td><span className={`category-badge ${doc.category}`}>{doc.category}</span></td>
                  <td>{doc.queryCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Recent Queries */}
        <div className="table-card">
          <h2><Clock size={16} /> Recent Queries</h2>
          <div className="queries-list">
            {stats.recentQueries.map(q => (
              <div key={q._id} className="query-item">
                <div className="query-question">Q: {q.question}</div>
                <div className="query-meta">
                  <span>{q.user?.name || 'Anonymous'}</span>
                  <span className={`lang-badge ${q.language}`}>{q.language === 'hi' ? 'हिंदी' : 'EN'}</span>
                  <span>{new Date(q.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
