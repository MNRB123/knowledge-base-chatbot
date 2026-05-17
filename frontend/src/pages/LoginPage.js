import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { Bot, Mail, Lock, Eye, EyeOff, Loader } from 'lucide-react';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name}!`);
      navigate('/chat');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <Bot size={32} />
          <h1>KnowledgeBot</h1>
          <p>AI-Powered Knowledge Assistant</p>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Email</label>
            <div className="input-icon-wrap">
              <Mail size={16} className="input-icon" />
              <input type="email" placeholder="your@email.com" value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
            </div>
          </div>
          <div className="form-group">
            <label>Password</label>
            <div className="input-icon-wrap">
              <Lock size={16} className="input-icon" />
              <input type={showPwd ? 'text' : 'password'} placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
              <button type="button" className="pwd-toggle" onClick={() => setShowPwd(s => !s)}>
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <button type="submit" className="btn-primary full" disabled={loading}>
            {loading ? <Loader size={18} className="spin" /> : 'Sign In'}
          </button>
        </form>
        <p className="auth-footer">
          Don't have an account? <Link to="/register">Create one</Link>
        </p>
        <div className="demo-hint">
          <p>Demo: admin@demo.com / admin123</p>
        </div>
      </div>
    </div>
  );
}

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await register(form.name, form.email, form.password);
      toast.success(`Welcome, ${user.name}!`);
      navigate('/chat');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <Bot size={32} />
          <h1>Create Account</h1>
          <p>Join KnowledgeBot today</p>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
          {[
            { key: 'name', label: 'Full Name', type: 'text', placeholder: 'John Doe' },
            { key: 'email', label: 'Email', type: 'email', placeholder: 'your@email.com' },
            { key: 'password', label: 'Password', type: 'password', placeholder: '••••••••' }
          ].map(({ key, label, type, placeholder }) => (
            <div key={key} className="form-group">
              <label>{label}</label>
              <input type={type} placeholder={placeholder} value={form[key]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} required />
            </div>
          ))}
          <button type="submit" className="btn-primary full" disabled={loading}>
            {loading ? <Loader size={18} className="spin" /> : 'Create Account'}
          </button>
        </form>
        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
