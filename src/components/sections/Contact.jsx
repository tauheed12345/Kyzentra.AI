import React, { useState } from 'react';
import { Mail, Send, MessageSquareCode, CheckCircle2, Globe, Laptop } from 'lucide-react';
import ScrollSection from './ScrollSection';
import Turnstile from '../forms/Turnstile';
import { submitForm } from '../../utils/api';

const GithubIcon = ({ size = 18 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
  </svg>
);

const LinkedinIcon = ({ size = 18 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);

const TwitterIcon = ({ size = 18 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
  </svg>
);

const InstagramIcon = ({ size = 18 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    subject: 'general',
    message: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');
  const [submitError, setSubmitError] = useState('');

  const validate = () => {
    let newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.company.trim()) newErrors.company = 'Company is required';
    if (!formData.message.trim()) newErrors.message = 'Message content is required';
    // Turnstile is cosmetic — don't block submission if the widget fails
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setIsSubmitting(true);
    setSubmitError('');
    try {
      await submitForm('contact', formData, turnstileToken);
      setIsSuccess(true);
      setFormData({ name: '', email: '', company: '', subject: 'general', message: '' });
      setTurnstileToken('');
    } catch (err) {
      setSubmitError(err.message || 'Submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollSection id="contact" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr', 
          gap: '56px', 
          alignItems: 'start',
          width: '100%',
          maxWidth: '1280px',
          margin: '0 auto'
        }} 
        className="lg-grid-2"
      >
        
        {/* Left Column: Contact details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-cyan)', marginBottom: '16px' }}>
              <MessageSquareCode size={16} />
              <span style={{ fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'var(--font-heading)' }}>
                Get In Touch
              </span>
            </div>
            
            <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', lineHeight: 1.2, fontWeight: 800, marginBottom: '16px' }}>
              Let’s Connect.
            </h2>
            
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.6, maxWidth: '480px' }}>
              Whether you are an institution owner, developer, strategic partner, or interested applicant, we would love to collaborate.
            </p>
          </div>

          {/* Details matrix */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Status: Remote-first company */}
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ color: 'var(--accent-cyan)', background: 'rgba(6,182,212,0.06)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(6,182,212,0.1)' }}>
                <Laptop size={18} />
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Company Operations</span>
                <span style={{ fontSize: '1rem', color: 'white', fontWeight: 600 }}>
                  Remote-first company
                </span>
              </div>
            </div>

            {/* Email Address details */}
            <div style={{ display: 'flex', gap: '16px', alignItems: 'start' }}>
              <div style={{ color: 'var(--accent-blue)', background: 'rgba(37,99,235,0.06)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(37,99,235,0.1)' }}>
                <Mail size={18} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div>
                  <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>General Contact</span>
                  <a href="mailto:official@kyzentra.in" style={{ fontSize: '0.96rem', color: 'white', textDecoration: 'none', fontWeight: 600, transition: 'color 0.2s' }} onMouseEnter={(e)=>e.target.style.color='var(--accent-blue)'} onMouseLeave={(e)=>e.target.style.color='white'}>
                    official@kyzentra.in
                  </a>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 24px' }} className="contact-emails-grid">
                  <div>
                    <span style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>Business enquiries</span>
                    <a href="mailto:official@kyzentra.in" style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 500 }}>
                      official@kyzentra.in
                    </a>
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>Partnership enquiries</span>
                    <a href="mailto:official@kyzentra.in" style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 500 }}>
                      official@kyzentra.in
                    </a>
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>Careers</span>
                    <a href="mailto:careers@kyzentra.in" style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 500 }}>
                      careers@kyzentra.in
                    </a>
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>General support</span>
                    <a href="mailto:official@kyzentra.in" style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 500 }}>
                      official@kyzentra.in
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Global Web link */}
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ color: 'var(--accent-purple)', background: 'rgba(139,92,246,0.06)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(139,92,246,0.1)' }}>
                <Globe size={18} />
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Global Site</span>
                <span style={{ fontSize: '1rem', color: 'white', fontWeight: 600 }}>
                  www.kyzentra.in
                </span>
              </div>
            </div>
          </div>

          {/* Social Network row */}
          <div>
            <h4 style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>
              Follow our Journey
            </h4>
            <div style={{ display: 'flex', gap: '12px' }}>
              <a href="https://github.com" className="social-icon" target="_blank" rel="noreferrer"><GithubIcon size={18} /></a>
              <a href="https://linkedin.com" className="social-icon" target="_blank" rel="noreferrer"><LinkedinIcon size={18} /></a>
              <a href="https://instagram.com" className="social-icon" target="_blank" rel="noreferrer"><InstagramIcon size={18} /></a>
              <a href="https://x.com" className="social-icon" target="_blank" rel="noreferrer"><TwitterIcon size={18} /></a>
            </div>
          </div>
        </div>

        {/* Right Column: Inquiry Form */}
        <div className="glass-card" style={{ padding: '36px', background: 'rgba(11, 11, 20, 0.5)', width: '100%' }}>
          {isSuccess ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 0' }}>
              <CheckCircle2 size={56} style={{ color: '#10b981', filter: 'drop-shadow(0 0 10px rgba(16,185,129,0.3))', marginBottom: '20px' }} />
              <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'white', marginBottom: '12px' }}>Message Dispatched!</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', maxWidth: '300px', lineHeight: 1.6, marginBottom: '24px' }}>
                Thank you for reaching out. A Kyzentra representative has received your ticket and will respond within 24 hours.
              </p>
              <button onClick={() => setIsSuccess(false)} className="btn-secondary" style={{ minWidth: '150px' }}>
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '4px' }}>Send a Message</h3>

              {submitError && (
                <div style={{
                  padding: '10px 14px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  color: '#fca5a5',
                  fontSize: '0.85rem',
                  textAlign: 'left'
                }}>
                  {submitError}
                </div>
              )}
              
              {/* Name */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Your Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Alex Johnson"
                  className="contact-input"
                  style={inputStyle(errors.name)}
                />
                {errors.name && <span style={errorStyle}>{errors.name}</span>}
              </div>

              {/* Email */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="alex@example.com"
                  className="contact-input"
                  style={inputStyle(errors.email)}
                />
                {errors.email && <span style={errorStyle}>{errors.email}</span>}
              </div>

              {/* Company */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Company / Organization</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="State Academy / Kyzentra Corp"
                  className="contact-input"
                  style={inputStyle(errors.company)}
                />
                {errors.company && <span style={errorStyle}>{errors.company}</span>}
              </div>

              {/* Subject */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Subject</label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="contact-input"
                  style={{ ...inputStyle(false), appearance: 'none', background: 'rgba(255,255,255,0.02)', color: 'white' }}
                >
                  <option value="general" style={{ backgroundColor: '#09090e' }}>General Inquiry</option>
                  <option value="partnership" style={{ backgroundColor: '#09090e' }}>Partnership Proposal</option>
                  <option value="investor" style={{ backgroundColor: '#09090e' }}>Investor Relations</option>
                  <option value="press" style={{ backgroundColor: '#09090e' }}>Press / Media</option>
                </select>
              </div>

              {/* Message */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Message</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tell us details of your inquiry..."
                  className="contact-input"
                  rows={3}
                  style={{ ...inputStyle(errors.message), resize: 'none', height: '80px', padding: '12px', color: 'white' }}
                />
                {errors.message && <span style={errorStyle}>{errors.message}</span>}
              </div>

              {/* Turnstile Protection */}
              <Turnstile
                onSuccess={(token) => setTurnstileToken(token)}
                onError={() => setErrors(prev => ({ ...prev, turnstile: 'Turnstile check failed. Please refresh.' }))}
                onExpire={() => setTurnstileToken('')}
              />
              {errors.turnstile && <span style={{ ...errorStyle, textAlign: 'center', display: 'block' }}>{errors.turnstile}</span>}

              {/* Submit */}
              <button
                type="submit"
                className="btn-primary"
                disabled={isSubmitting}
                style={{ width: '100%', padding: '12px', display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center', marginTop: '4px' }}
              >
                {isSubmitting ? (
                  <>
                    <div className="spinner" />
                    Sending Message...
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    Send Message
                  </>
                )}
              </button>
            </form>
          )}
        </div>

      </div>

      <style>{`
        .contact-input {
          width: 100%;
          padding: 10px 14px;
          border-radius: 8px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.08);
          color: white;
          font-family: var(--font-sans);
          font-size: 0.9rem;
          outline: none;
          transition: all 0.3s ease;
        }

        .contact-input:focus {
          background: rgba(255,255,255,0.04);
          border-color: var(--accent-cyan);
          box-shadow: 0 0 0 3px rgba(6,182,212,0.15);
        }

        .social-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
          background-color: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.05);
          width: 40px;
          height: 40px;
          border-radius: 50%;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          text-decoration: none;
        }

        .social-icon:hover {
          color: white;
          background-color: rgba(255,255,255,0.06);
          border-color: rgba(255,255,255,0.15);
          transform: translateY(-2px);
        }
      `}</style>
    </ScrollSection>
  );
}

// Styling helper functions
const inputStyle = (hasError) => ({
  border: hasError ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(255, 255, 255, 0.08)',
  boxShadow: hasError ? '0 0 0 3px rgba(239, 68, 68, 0.15)' : 'none'
});

const errorStyle = {
  fontSize: '0.72rem',
  color: '#ef4444',
  fontWeight: 500,
  marginTop: '2px'
};
