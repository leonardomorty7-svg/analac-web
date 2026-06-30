import React from 'react';
import type { OrganizationDTO } from '../../services/directory/types';

interface OrganizationCardProps {
  organization: OrganizationDTO;
}

export default function OrganizationCard({ organization }: OrganizationCardProps) {
  return (
    <div className="org-card" style={{
      background: '#fff',
      border: '1px solid rgba(0,0,0,0.06)',
      borderRadius: '20px',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 4px 16px rgba(0,0,0,0.02)',
      transition: 'all 0.3s ease',
      height: '100%',
      position: 'relative'
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '20px' }}>
        <img 
          src={organization.logo} 
          alt={`Logo de ${organization.name}`} 
          style={{ width: '64px', height: '64px', borderRadius: '12px', objectFit: 'cover', border: '1px solid rgba(0,0,0,0.05)' }} 
        />
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--c-green-deep)', marginBottom: '4px', lineHeight: 1.2 }}>
            {organization.name}
            {organization.verified && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#6db56d', marginLeft: '6px', display: 'inline-block', verticalAlign: 'text-bottom' }}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            )}
          </h3>
          <p style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>
            {organization.category} • {organization.type}
          </p>
          <div style={{ display: 'inline-block', background: 'rgba(109, 181, 109, 0.1)', color: 'var(--c-green)', padding: '4px 10px', borderRadius: '100px', fontSize: '12px', fontWeight: 600 }}>
            {organization.status}
          </div>
        </div>
      </div>

      <p style={{ fontSize: '14px', color: '#555', lineHeight: 1.6, marginBottom: '20px', flexGrow: 1 }}>
        {organization.summary}
      </p>

      <div style={{ borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '16px', marginTop: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#777', marginBottom: '16px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
          {organization.location.city}, {organization.location.department}
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <a href={`/asociados-y-aliados/directorio/${organization.slug}`} style={{ 
            flex: 1, 
            textAlign: 'center', 
            background: 'var(--c-green)', 
            color: '#fff', 
            textDecoration: 'none', 
            padding: '10px 16px', 
            borderRadius: '100px', 
            fontSize: '14px', 
            fontWeight: 600,
            transition: 'background 0.2s'
          }}>
            Ver perfil
          </a>
          <a href={`mailto:${organization.contacts.email}`} style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: '1px solid rgba(0,0,0,0.1)',
            color: 'var(--c-green-deep)',
            textDecoration: 'none',
            transition: 'all 0.2s'
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
          </a>
        </div>
      </div>
    </div>
  );
}
