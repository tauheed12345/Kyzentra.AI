import React from 'react';
import { Mail } from 'lucide-react';
import logoFooter from '../assets/logo_footer.png';

const GithubIcon = ({ size = 16 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
  </svg>
);

const LinkedinIcon = ({ size = 16 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);

const TwitterIcon = ({ size = 16 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
  </svg>
);

export default function Footer({ onOpenWaitlist, onOpenDemo, setActiveSection }) {
  const handleLinkClick = (id) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const footerLinks = {
    company: [
      { label: 'Home', action: () => handleLinkClick('hero') },
      { label: 'About', action: () => handleLinkClick('about') },
      { label: 'Careers', action: () => handleLinkClick('careers') },
      { label: 'Contact', action: () => handleLinkClick('contact') }
    ],
    products: [
      { label: 'UniOS.ai', action: () => handleLinkClick('products'), badge: 'Soon' },
      { label: 'AI Analytics', action: () => handleLinkClick('products') },
      { label: 'Parent Portal', action: () => handleLinkClick('products') }
    ],
    careers: [
      { label: 'Open Roles', action: () => handleLinkClick('careers') },
      { label: 'Internships', action: () => handleLinkClick('careers') },
      { label: 'Company Culture', action: () => handleLinkClick('about') }
    ],
    legal: [
      { label: 'Privacy Policy', url: '#' },
      { label: 'Terms of Service', url: '#' },
      { label: 'Security Protocols', url: '#' }
    ]
  };

  return (
    <footer 
      style={{
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        backgroundColor: '#040407',
        padding: '80px 24px 40px',
        width: '100%'
      }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '60px' }}>
        
        {/* Top Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px' }} className="footer-grid">
          
          {/* Logo & Pitch column */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '20px', maxWidth: '300px' }} className="logo-col">
            <img src={logoFooter} alt="Kyzentra.AI Logo" style={{ height: '110px', width: 'auto', marginBottom: '8px' }} />
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6 }}>
              Building the future of AI-powered software products that empower organizations and simplify complex administrative workflows.
            </p>
            <div style={{ display: 'flex', gap: '12px', marginTop: '4px', justifyContent: 'center' }}>
              <a href="https://github.com" className="social-icon-footer" target="_blank" rel="noreferrer"><GithubIcon size={16} /></a>
              <a href="https://linkedin.com" className="social-icon-footer" target="_blank" rel="noreferrer"><LinkedinIcon size={16} /></a>
              <a href="https://twitter.com" className="social-icon-footer" target="_blank" rel="noreferrer"><TwitterIcon size={16} /></a>
            </div>
          </div>

          {/* Dynamic Link groups */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h4 style={{ fontSize: '0.85rem', color: 'white', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Company</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {footerLinks.company.map((link, idx) => (
                <li key={idx}>
                  <button onClick={link.action} className="footer-btn">{link.label}</button>
                </li>
              ))}
            </ul>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h4 style={{ fontSize: '0.85rem', color: 'white', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Products</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {footerLinks.products.map((link, idx) => (
                <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button onClick={link.action} className="footer-btn">{link.label}</button>
                  {link.badge && (
                    <span style={{ fontSize: '0.62rem', backgroundColor: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.2)', color: 'var(--accent-blue)', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>
                      {link.badge}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h4 style={{ fontSize: '0.85rem', color: 'white', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Careers</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {footerLinks.careers.map((link, idx) => (
                <li key={idx}>
                  <button onClick={link.action} className="footer-btn">{link.label}</button>
                </li>
              ))}
            </ul>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h4 style={{ fontSize: '0.85rem', color: 'white', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Legal</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {footerLinks.legal.map((link, idx) => (
                <li key={idx}>
                  <a href={link.url} className="footer-btn" style={{ textDecoration: 'none' }}>{link.label}</a>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom copyright segment */}
        <div 
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.04)',
            paddingTop: '32px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '20px',
            fontSize: '0.8rem',
            color: 'var(--text-muted)'
          }}
        >
          <span>
            © 2026 Kyzentra. AI-first school management. All rights reserved.
          </span>
          <div style={{ display: 'flex', gap: '24px' }}>
            <span>Designed & Engineered globally.</span>
            <a href="mailto:official@kyzentra.in" style={{ color: 'var(--text-secondary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Mail size={12} /> Support Helpdesk
            </a>
          </div>
        </div>

      </div>

      <style>{`
        .footer-btn {
          background: none;
          border: none;
          color: var(--text-secondary);
          font-size: 0.88rem;
          font-family: var(--font-sans);
          cursor: pointer;
          transition: color 0.2s ease;
          padding: 0;
          text-align: left;
        }

        .footer-btn:hover {
          color: white;
        }

        .social-icon-footer {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          background-color: rgba(255,255,255,0.01);
          border: 1px solid rgba(255,255,255,0.04);
          width: 32px;
          height: 32px;
          border-radius: 50%;
          transition: all 0.3s ease;
          text-decoration: none;
        }

        .social-icon-footer:hover {
          color: white;
          background-color: rgba(255,255,255,0.04);
          border-color: rgba(255,255,255,0.1);
        }

        @media (max-width: 768px) {
          .footer-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .logo-col {
            grid-column: span 2;
            max-width: 100% !important;
          }
        }

        @media (max-width: 480px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
          }
          .logo-col {
            grid-column: span 1;
          }
        }
      `}</style>
    </footer>
  );
}
