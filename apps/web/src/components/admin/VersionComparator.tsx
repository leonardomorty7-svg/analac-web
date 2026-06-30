import React from 'react';

export default function VersionComparator({ revisionData, publicData }: { revisionData: any, publicData: any }) {
  if (!revisionData) return <div>No hay datos en el borrador.</div>;

  // Renderizador genérico de sección
  const renderSection = (title: string, data: any) => {
    if (!data || Object.keys(data).length === 0) return null;
    
    return (
      <div style={{ marginBottom: '24px' }}>
        <h4 style={{ fontSize: '15px', color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', margin: '0 0 12px 0' }}>{title}</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
          {Object.entries(data).map(([key, val]) => {
            if (val === null || val === undefined || val === '') return null;
            if (Array.isArray(val) && val.length === 0) return null;
            
            // Render array of strings
            if (Array.isArray(val) && typeof val[0] === 'string') {
               return (
                 <div key={key}>
                   <strong style={{ fontSize: '13px', color: '#64748b', display: 'block', textTransform: 'capitalize' }}>{key}</strong>
                   <ul style={{ margin: '4px 0', paddingLeft: '20px', fontSize: '14px' }}>
                     {val.map((item, i) => <li key={i}>{item}</li>)}
                   </ul>
                 </div>
               )
            }

            // Render array of objects
            if (Array.isArray(val) && typeof val[0] === 'object') {
              return (
                 <div key={key}>
                   <strong style={{ fontSize: '13px', color: '#64748b', display: 'block', textTransform: 'capitalize' }}>{key}</strong>
                   <ul style={{ margin: '4px 0', paddingLeft: '20px', fontSize: '14px' }}>
                     {val.map((item, i) => <li key={i}>{JSON.stringify(item)}</li>)}
                   </ul>
                 </div>
               )
            }
            
            // Strings / Numbers / Booleans
            const isUrl = typeof val === 'string' && val.startsWith('http');
            return (
              <div key={key} style={{ background: '#f8fafc', padding: '8px 12px', borderRadius: '6px' }}>
                <strong style={{ fontSize: '12px', color: '#64748b', display: 'block', textTransform: 'capitalize', marginBottom: '4px' }}>{key.replace('_', ' ')}</strong>
                {isUrl ? (
                  <a href={val as string} target="_blank" style={{ fontSize: '14px', color: '#38bdf8', wordBreak: 'break-all' }}>{val}</a>
                ) : (
                  <span style={{ fontSize: '14px', color: '#0f172a', whiteSpace: 'pre-wrap' }}>{String(val)}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }}>
      {revisionData.basicInfo && renderSection('Información Básica', revisionData.basicInfo)}
      {revisionData.summaryData && renderSection('Resumen', revisionData.summaryData)}
      {revisionData.descriptionData && renderSection('Descripción', revisionData.descriptionData)}
      
      {/* Arrays Especiales */}
      {(revisionData.categories?.length > 0 || revisionData.products?.length > 0 || revisionData.services?.length > 0) && (
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ fontSize: '15px', color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', margin: '0 0 12px 0' }}>Categorías y Oferta</h4>
          {revisionData.categories?.length > 0 && <div style={{ fontSize: '14px', marginBottom: '8px' }}><strong>Categorías:</strong> {revisionData.categories.join(', ')}</div>}
          {revisionData.products?.length > 0 && <div style={{ fontSize: '14px', marginBottom: '8px' }}><strong>Productos:</strong> {revisionData.products.join(', ')}</div>}
          {revisionData.services?.length > 0 && <div style={{ fontSize: '14px', marginBottom: '8px' }}><strong>Servicios:</strong> {revisionData.services.join(', ')}</div>}
        </div>
      )}

      {revisionData.locationData && renderSection('Ubicación y Cobertura', revisionData.locationData)}
      {revisionData.contactData && renderSection('Contacto Público y Privado', revisionData.contactData)}
      
      {revisionData.socialLinks?.length > 0 && (
         <div style={{ marginBottom: '24px' }}>
           <h4 style={{ fontSize: '15px', color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', margin: '0 0 12px 0' }}>Redes Sociales</h4>
           <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px' }}>
             {revisionData.socialLinks.map((s:any, i:number) => (
               <li key={i}><strong>{s.platform}:</strong> <a href={s.url} target="_blank">{s.url}</a></li>
             ))}
           </ul>
         </div>
      )}

      {revisionData.mediaData && renderSection('Multimedia', revisionData.mediaData)}
      {revisionData.docsData && renderSection('Documentos y Certificaciones', revisionData.docsData)}
      {revisionData.faqs?.length > 0 && renderSection('Preguntas Frecuentes', revisionData.faqs)}
      {revisionData.legalData && renderSection('Información Legal', revisionData.legalData)}

    </div>
  );
}
