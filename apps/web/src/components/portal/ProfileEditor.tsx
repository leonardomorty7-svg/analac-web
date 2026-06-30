import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getSupabaseBrowser } from '../../lib/supabase/browser';

// Interfaces
interface EditorProps {
  revisionId: string | null;
  initialData: any;
  revisionStatus: string;
}

export default function ProfileEditor({ revisionId, initialData, revisionStatus }: EditorProps) {
  const [data, setData] = useState(initialData || {});
  const [activeTab, setActiveTab] = useState('basicInfo');
  const [saveStatus, setSaveStatus] = useState<'idle'|'saving'|'saved'|'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [currentRevisionId, setCurrentRevisionId] = useState(revisionId);

  const [uploading, setUploading] = useState(false);
  
  const supabase = getSupabaseBrowser();
  const isReadOnly = ['pending_review', 'approved'].includes(revisionStatus);

  // Auto-save logic (debounced)
  useEffect(() => {
    if (isReadOnly) return;
    
    const handler = setTimeout(() => {
      saveDraft();
    }, 2000); // 2 seconds debounce
    
    return () => clearTimeout(handler);
  }, [data]);

  const saveDraft = async () => {
    if (isReadOnly) return;
    setSaveStatus('saving');
    
    try {
      const res = await fetch('/api/portal/revisions/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          revisionId: currentRevisionId,
          revisionData: data
        })
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Error al guardar');
      }
      
      const responseData = await res.json();
      if (responseData.id && !currentRevisionId) {
        setCurrentRevisionId(responseData.id);
      }
      
      setSaveStatus('saved');
      setErrorMessage('');
    } catch (err: any) {
      setSaveStatus('error');
      setErrorMessage(err.message);
    }
  };

  const submitReview = async () => {
    if (isReadOnly) return;
    
    if (!data.legalData?.veracity_declaration) {
      alert("Debes aceptar la declaración de veracidad en la pestaña Legal.");
      return;
    }
    if (!data.legalData?.authorization) {
      alert("Debes aceptar la autorización de publicación en la pestaña Legal.");
      return;
    }

    if (!confirm("¿Estás seguro de enviar tu perfil a revisión? No podrás editarlo mientras se evalúa.")) return;
    
    setSaveStatus('saving');
    try {
      const res = await fetch('/api/portal/revisions/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          revisionId: currentRevisionId,
          revisionData: data
        })
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Error al enviar');
      }
      
      window.location.href = '/portal-aliados';
    } catch (err: any) {
      setSaveStatus('error');
      setErrorMessage(err.message);
      alert(err.message);
    }
  };

  const updateData = (section: string, field: string, value: any) => {
    if (isReadOnly) return;
    setData((prev: any) => ({
      ...prev,
      [section]: {
        ...(prev[section] || {}),
        [field]: value
      }
    }));
    setSaveStatus('idle');
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, section: string, field: string, bucket: string = 'public-media') => {
    if (isReadOnly) return;
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${currentRevisionId || 'new'}/${fileName}`;

      const { error: uploadError, data: uploadData } = await supabase.storage.from(bucket).upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(filePath);
      
      updateData(section, field, publicUrl);
    } catch (error: any) {
      alert('Error subiendo archivo: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleArrayChange = (section: string, field: string, index: number, value: any, arrayType: 'string'|'object' = 'string', objKey: string = '') => {
    if (isReadOnly) return;
    const currentArray = [...(data[section]?.[field] || [])];
    
    if (arrayType === 'string') {
      currentArray[index] = value;
    } else {
      currentArray[index] = { ...currentArray[index], [objKey]: value };
    }
    
    updateData(section, field, currentArray);
  };

  const addArrayItem = (section: string, field: string, defaultValue: any) => {
    if (isReadOnly) return;
    const currentArray = [...(data[section]?.[field] || [])];
    currentArray.push(defaultValue);
    updateData(section, field, currentArray);
  };

  const removeArrayItem = (section: string, field: string, index: number) => {
    if (isReadOnly) return;
    const currentArray = [...(data[section]?.[field] || [])];
    currentArray.splice(index, 1);
    updateData(section, field, currentArray);
  };

  const tabs = [
    { id: 'basicInfo', label: 'Información Básica' },
    { id: 'categoriesData', label: 'Categorías y Productos' },
    { id: 'summaryData', label: 'Resumen' },
    { id: 'descriptionData', label: 'Descripción' },
    { id: 'locationData', label: 'Ubicación y Cobertura' },
    { id: 'contactData', label: 'Contacto y Redes' },
    { id: 'mediaData', label: 'Galería y Multimedia' },
    { id: 'docsData', label: 'Certificaciones y Documentos' },
    { id: 'faqsData', label: 'Preguntas Frecuentes' },
    { id: 'legalData', label: 'Legal y Envío' },
  ];

  return (
    <div className="profile-editor" style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
      
      {/* Sidebar Tabs */}
      <div style={{ width: '260px', background: 'white', borderRadius: '12px', border: '1px solid var(--p-border)', padding: '8px' }}>
        {tabs.map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              width: '100%',
              textAlign: 'left',
              padding: '12px 16px',
              background: activeTab === tab.id ? '#f1f5f9' : 'transparent',
              color: activeTab === tab.id ? 'var(--p-text-main)' : 'var(--p-text-sub)',
              fontWeight: activeTab === tab.id ? 600 : 500,
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              marginBottom: '4px'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Editor Content */}
      <div style={{ flex: 1, background: 'white', borderRadius: '12px', border: '1px solid var(--p-border)', padding: '32px' }}>
        
        {/* Editor Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', borderBottom: '1px solid var(--p-border)', paddingBottom: '16px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600 }}>{tabs.find(t => t.id === activeTab)?.label}</h2>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {saveStatus === 'saving' && <span style={{ color: 'var(--p-text-sub)', fontSize: '14px' }}>Guardando...</span>}
            {saveStatus === 'saved' && <span style={{ color: '#15803d', fontSize: '14px' }}>✓ Guardado</span>}
            {saveStatus === 'error' && <span style={{ color: '#ef4444', fontSize: '14px' }}>Error</span>}
            
            <button 
              onClick={submitReview}
              disabled={isReadOnly || !currentRevisionId}
              style={{
                background: isReadOnly ? '#94a3b8' : 'var(--p-primary)',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                fontWeight: 500,
                cursor: isReadOnly ? 'not-allowed' : 'pointer'
              }}
            >
              Enviar a Revisión
            </button>
          </div>
        </div>

        {isReadOnly && (
          <div style={{ background: '#fef3c7', color: '#92400e', padding: '12px', borderRadius: '8px', marginBottom: '24px', fontSize: '14px' }}>
            <strong>Perfil en Revisión.</strong> No puedes realizar cambios en este momento.
          </div>
        )}

        {errorMessage && saveStatus === 'error' && (
          <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '12px', borderRadius: '8px', marginBottom: '24px', fontSize: '14px' }}>
            {errorMessage}
          </div>
        )}

        {uploading && (
           <div style={{ background: '#e0f2fe', color: '#0369a1', padding: '12px', borderRadius: '8px', marginBottom: '24px', fontSize: '14px' }}>
             Subiendo archivo, por favor espera...
           </div>
        )}

        {/* --- TABS CONTENT --- */}

        {activeTab === 'basicInfo' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={labelStyle}>Nombre Comercial <span style={reqStyle}>*</span></label>
              <input 
                type="text" 
                value={data.basicInfo?.name || ''} 
                onChange={(e) => updateData('basicInfo', 'name', e.target.value)}
                style={inputStyle} 
                placeholder="Ej. Lácteos del Valle S.A.S"
                disabled={isReadOnly}
              />
            </div>
            <div>
              <label style={labelStyle}>Año de Fundación</label>
              <input 
                type="number" 
                value={data.basicInfo?.foundation_year || ''} 
                onChange={(e) => updateData('basicInfo', 'foundation_year', parseInt(e.target.value))}
                style={inputStyle} 
                placeholder="Ej. 1995"
                disabled={isReadOnly}
              />
            </div>
            <div>
              <label style={labelStyle}>Logo (Imagen)</label>
              {data.basicInfo?.logo_url && (
                <img src={data.basicInfo.logo_url} alt="Logo" style={{ width: '100px', height: '100px', objectFit: 'contain', marginBottom: '10px', borderRadius: '8px', border: '1px solid #eaeaea' }}/>
              )}
              <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'basicInfo', 'logo_url')} disabled={isReadOnly || uploading} />
            </div>
            <div>
              <label style={labelStyle}>Portada (Banner)</label>
              {data.basicInfo?.cover_url && (
                <img src={data.basicInfo.cover_url} alt="Cover" style={{ width: '100%', height: '150px', objectFit: 'cover', marginBottom: '10px', borderRadius: '8px', border: '1px solid #eaeaea' }}/>
              )}
              <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'basicInfo', 'cover_url')} disabled={isReadOnly || uploading} />
            </div>
          </div>
        )}

        {activeTab === 'categoriesData' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={labelStyle}>Categorías (IDs)</label>
              {(data.categories || []).map((cat: string, index: number) => (
                <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <input type="text" value={cat} onChange={e => handleArrayChange('categories', '', index, e.target.value, 'string')} style={inputStyle} disabled={isReadOnly} />
                  <button onClick={() => removeArrayItem('categories', '', index)} style={btnDangerStyle} disabled={isReadOnly}>X</button>
                </div>
              ))}
              <button onClick={() => addArrayItem('categories', '', '')} style={btnStyle} disabled={isReadOnly}>+ Agregar Categoría</button>
            </div>
            <hr style={{ border: 'none', borderTop: '1px solid var(--p-border)' }} />
            <div>
              <label style={labelStyle}>Productos Resumidos</label>
              {(data.products || []).map((prod: string, index: number) => (
                <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <input type="text" value={prod} onChange={e => handleArrayChange('products', '', index, e.target.value, 'string')} style={inputStyle} disabled={isReadOnly} placeholder="Ej. Queso Campesino" />
                  <button onClick={() => removeArrayItem('products', '', index)} style={btnDangerStyle} disabled={isReadOnly}>X</button>
                </div>
              ))}
              <button onClick={() => addArrayItem('products', '', '')} style={btnStyle} disabled={isReadOnly}>+ Agregar Producto</button>
            </div>
            <hr style={{ border: 'none', borderTop: '1px solid var(--p-border)' }} />
            <div>
              <label style={labelStyle}>Servicios</label>
              {(data.services || []).map((serv: string, index: number) => (
                <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <input type="text" value={serv} onChange={e => handleArrayChange('services', '', index, e.target.value, 'string')} style={inputStyle} disabled={isReadOnly} placeholder="Ej. Transporte de leche refrigerada" />
                  <button onClick={() => removeArrayItem('services', '', index)} style={btnDangerStyle} disabled={isReadOnly}>X</button>
                </div>
              ))}
              <button onClick={() => addArrayItem('services', '', '')} style={btnStyle} disabled={isReadOnly}>+ Agregar Servicio</button>
            </div>
          </div>
        )}

        {activeTab === 'summaryData' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={labelStyle}>Resumen Institucional (AEO / SEO) <span style={reqStyle}>*</span></label>
              <textarea 
                value={data.summaryData?.summary || ''} 
                onChange={(e) => updateData('summaryData', 'summary', e.target.value)}
                style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }} 
                maxLength={400}
                placeholder="Un párrafo directo respondiendo quiénes son y qué hacen."
                disabled={isReadOnly}
              />
            </div>
          </div>
        )}

        {activeTab === 'descriptionData' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={labelStyle}>Descripción y Trayectoria <span style={reqStyle}>*</span></label>
              <textarea 
                value={data.descriptionData?.description || ''} 
                onChange={(e) => updateData('descriptionData', 'description', e.target.value)}
                style={{ ...inputStyle, minHeight: '200px', resize: 'vertical' }} 
                placeholder="Historia, experiencia y capacidades completas..."
                disabled={isReadOnly}
              />
            </div>
          </div>
        )}

        {activeTab === 'locationData' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Departamento Base</label>
                <input type="text" value={data.locationData?.department || ''} onChange={(e) => updateData('locationData', 'department', e.target.value)} style={inputStyle} disabled={isReadOnly} />
              </div>
              <div>
                <label style={labelStyle}>Ciudad Base</label>
                <input type="text" value={data.locationData?.city || ''} onChange={(e) => updateData('locationData', 'city', e.target.value)} style={inputStyle} disabled={isReadOnly} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Dirección Física</label>
              <input type="text" value={data.locationData?.address || ''} onChange={(e) => updateData('locationData', 'address', e.target.value)} style={inputStyle} disabled={isReadOnly} />
            </div>
            <hr style={{ border: 'none', borderTop: '1px solid var(--p-border)' }} />
            <div>
              <label style={labelStyle}>Zonas de Cobertura</label>
              <p style={{ fontSize: '13px', color: 'var(--p-text-sub)', marginBottom: '8px' }}>Añade los departamentos o regiones donde operas.</p>
              {(data.locationData?.coverage || []).map((cov: string, index: number) => (
                <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <input type="text" value={cov} onChange={e => handleArrayChange('locationData', 'coverage', index, e.target.value, 'string')} style={inputStyle} disabled={isReadOnly} placeholder="Ej. Eje Cafetero" />
                  <button onClick={() => removeArrayItem('locationData', 'coverage', index)} style={btnDangerStyle} disabled={isReadOnly}>X</button>
                </div>
              ))}
              <button onClick={() => addArrayItem('locationData', 'coverage', '')} style={btnStyle} disabled={isReadOnly}>+ Agregar Zona</button>
            </div>
          </div>
        )}

        {activeTab === 'contactData' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Contactos Públicos</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Correo Público</label>
                <input type="email" value={data.contactData?.email || ''} onChange={(e) => updateData('contactData', 'email', e.target.value)} style={inputStyle} disabled={isReadOnly} />
              </div>
              <div>
                <label style={labelStyle}>Teléfono de Contacto</label>
                <input type="tel" value={data.contactData?.phone || ''} onChange={(e) => updateData('contactData', 'phone', e.target.value)} style={inputStyle} disabled={isReadOnly} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Sitio Web</label>
              <input type="url" value={data.contactData?.website || ''} onChange={(e) => updateData('contactData', 'website', e.target.value)} style={inputStyle} disabled={isReadOnly} />
            </div>
            
            <hr style={{ border: 'none', borderTop: '1px solid var(--p-border)' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Contactos Administrativos Privados</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Correo Administrativo (No Público)</label>
                <input type="email" value={data.contactData?.private_email || ''} onChange={(e) => updateData('contactData', 'private_email', e.target.value)} style={inputStyle} disabled={isReadOnly} />
              </div>
              <div>
                <label style={labelStyle}>Teléfono Administrativo (No Público)</label>
                <input type="tel" value={data.contactData?.private_phone || ''} onChange={(e) => updateData('contactData', 'private_phone', e.target.value)} style={inputStyle} disabled={isReadOnly} />
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--p-border)' }} />
            <div>
              <label style={labelStyle}>Redes Sociales</label>
              {(data.socialLinks || []).map((link: any, index: number) => (
                <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <select value={link.platform || ''} onChange={e => handleArrayChange('socialLinks', '', index, e.target.value, 'object', 'platform')} style={{...inputStyle, width: '150px'}} disabled={isReadOnly}>
                    <option value="">Plataforma...</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Facebook">Facebook</option>
                    <option value="Instagram">Instagram</option>
                    <option value="X">X (Twitter)</option>
                    <option value="YouTube">YouTube</option>
                  </select>
                  <input type="url" value={link.url || ''} onChange={e => handleArrayChange('socialLinks', '', index, e.target.value, 'object', 'url')} style={inputStyle} disabled={isReadOnly} placeholder="https://..." />
                  <button onClick={() => removeArrayItem('socialLinks', '', index)} style={btnDangerStyle} disabled={isReadOnly}>X</button>
                </div>
              ))}
              <button onClick={() => addArrayItem('socialLinks', '', {platform: '', url: ''})} style={btnStyle} disabled={isReadOnly}>+ Agregar Red Social</button>
            </div>
          </div>
        )}

        {activeTab === 'mediaData' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={labelStyle}>Galería de Imágenes</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '10px', marginBottom: '10px' }}>
                {(data.mediaData?.gallery || []).map((imgUrl: string, index: number) => (
                   <div key={index} style={{ position: 'relative' }}>
                     <img src={imgUrl} alt="Gallery" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }}/>
                     <button onClick={() => removeArrayItem('mediaData', 'gallery', index)} style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'red', color: 'white', borderRadius: '50%', border: 'none', width: '20px', height: '20px', cursor: 'pointer' }} disabled={isReadOnly}>X</button>
                   </div>
                ))}
              </div>
              {/* Ocultamos el input si no se puede usar de forma recursiva fácilmente en array, pero dejaremos un botón simulado para array de imágenes */}
              <input type="file" accept="image/*" onChange={async (e) => {
                if (isReadOnly) return;
                const file = e.target.files?.[0];
                if (!file) return;
                setUploading(true);
                try {
                  const fileExt = file.name.split('.').pop();
                  const filePath = `${currentRevisionId || 'new'}/${Math.random()}.${fileExt}`;
                  const { error } = await supabase.storage.from('public-media').upload(filePath, file);
                  if (error) throw error;
                  const { data: { publicUrl } } = supabase.storage.from('public-media').getPublicUrl(filePath);
                  const currentArr = [...(data.mediaData?.gallery || [])];
                  currentArr.push(publicUrl);
                  updateData('mediaData', 'gallery', currentArr);
                } catch (err:any) {
                  alert("Error: " + err.message);
                } finally { setUploading(false); }
              }} disabled={isReadOnly || uploading} />
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--p-border)' }} />
            <div>
              <label style={labelStyle}>Enlaces de Video (YouTube/Vimeo)</label>
              {(data.mediaData?.videos || []).map((vid: string, index: number) => (
                <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <input type="url" value={vid} onChange={e => handleArrayChange('mediaData', 'videos', index, e.target.value, 'string')} style={inputStyle} disabled={isReadOnly} placeholder="https://youtube.com/watch?v=..." />
                  <button onClick={() => removeArrayItem('mediaData', 'videos', index)} style={btnDangerStyle} disabled={isReadOnly}>X</button>
                </div>
              ))}
              <button onClick={() => addArrayItem('mediaData', 'videos', '')} style={btnStyle} disabled={isReadOnly}>+ Agregar Video</button>
            </div>
          </div>
        )}

        {activeTab === 'docsData' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={labelStyle}>Certificaciones</label>
              {(data.docsData?.certifications || []).map((cert: string, index: number) => (
                <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <input type="text" value={cert} onChange={e => handleArrayChange('docsData', 'certifications', index, e.target.value, 'string')} style={inputStyle} disabled={isReadOnly} placeholder="Ej. ISO 9001" />
                  <button onClick={() => removeArrayItem('docsData', 'certifications', index)} style={btnDangerStyle} disabled={isReadOnly}>X</button>
                </div>
              ))}
              <button onClick={() => addArrayItem('docsData', 'certifications', '')} style={btnStyle} disabled={isReadOnly}>+ Agregar Certificación</button>
            </div>
            
            <hr style={{ border: 'none', borderTop: '1px solid var(--p-border)' }} />
            <div>
               <label style={labelStyle}>Documentos Públicos (PDF)</label>
               {(data.docsData?.public_docs || []).map((doc: any, index: number) => (
                <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                  <a href={doc.url} target="_blank" style={{ color: 'var(--p-primary)' }}>{doc.name}</a>
                  <button onClick={() => removeArrayItem('docsData', 'public_docs', index)} style={btnDangerStyle} disabled={isReadOnly}>X</button>
                </div>
              ))}
              <input type="file" accept=".pdf" onChange={async (e) => {
                if (isReadOnly) return;
                const file = e.target.files?.[0];
                if (!file) return;
                setUploading(true);
                try {
                  const filePath = `public-docs/${currentRevisionId || 'new'}/${Math.random()}.pdf`;
                  const { error } = await supabase.storage.from('public-media').upload(filePath, file);
                  if (error) throw error;
                  const { data: { publicUrl } } = supabase.storage.from('public-media').getPublicUrl(filePath);
                  const currentArr = [...(data.docsData?.public_docs || [])];
                  currentArr.push({ name: file.name, url: publicUrl });
                  updateData('docsData', 'public_docs', currentArr);
                } catch (err:any) {
                  alert("Error: " + err.message);
                } finally { setUploading(false); }
              }} disabled={isReadOnly || uploading} />
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--p-border)' }} />
            <div>
               <label style={labelStyle}>Documentos Privados para ANALAC (PDF)</label>
               <p style={{ fontSize: '13px', color: 'var(--p-text-sub)' }}>Sube RUT, Cámara de Comercio, etc. No serán públicos.</p>
               {(data.docsData?.private_docs || []).map((doc: any, index: number) => (
                <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                  <span>{doc.name} (Subido)</span>
                  <button onClick={() => removeArrayItem('docsData', 'private_docs', index)} style={btnDangerStyle} disabled={isReadOnly}>X</button>
                </div>
              ))}
              <input type="file" accept=".pdf" onChange={async (e) => {
                if (isReadOnly) return;
                const file = e.target.files?.[0];
                if (!file) return;
                setUploading(true);
                try {
                  const filePath = `private-docs/${currentRevisionId || 'new'}/${Math.random()}.pdf`;
                  // En un caso real usaríamos private-docs bucket, pero aquí usamos una URL temporal para el JSON
                  const { error } = await supabase.storage.from('private-docs').upload(filePath, file);
                  if (error) throw error;
                  
                  const currentArr = [...(data.docsData?.private_docs || [])];
                  currentArr.push({ name: file.name, path: filePath });
                  updateData('docsData', 'private_docs', currentArr);
                } catch (err:any) {
                  alert("Error: " + err.message);
                } finally { setUploading(false); }
              }} disabled={isReadOnly || uploading} />
            </div>
          </div>
        )}

        {activeTab === 'faqsData' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={labelStyle}>Preguntas Frecuentes</label>
              {(data.faqs || []).map((faq: any, index: number) => (
                <div key={index} style={{ background: '#f9f9f9', padding: '16px', borderRadius: '8px', marginBottom: '16px', position: 'relative' }}>
                  <button onClick={() => removeArrayItem('faqs', '', index)} style={{...btnDangerStyle, position: 'absolute', top: '16px', right: '16px'}} disabled={isReadOnly}>X</button>
                  <label style={{...labelStyle, fontSize: '13px'}}>Pregunta</label>
                  <input type="text" value={faq.question || ''} onChange={e => handleArrayChange('faqs', '', index, e.target.value, 'object', 'question')} style={{...inputStyle, marginBottom: '8px'}} disabled={isReadOnly} />
                  <label style={{...labelStyle, fontSize: '13px'}}>Respuesta</label>
                  <textarea value={faq.answer || ''} onChange={e => handleArrayChange('faqs', '', index, e.target.value, 'object', 'answer')} style={{...inputStyle, minHeight: '60px'}} disabled={isReadOnly} />
                </div>
              ))}
              <button onClick={() => addArrayItem('faqs', '', {question: '', answer: ''})} style={btnStyle} disabled={isReadOnly}>+ Agregar Pregunta</button>
            </div>
          </div>
        )}

        {activeTab === 'legalData' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={labelStyle}>Responsable de la Información</label>
              <input type="text" value={data.legalData?.responsible_name || ''} onChange={(e) => updateData('legalData', 'responsible_name', e.target.value)} style={inputStyle} disabled={isReadOnly} placeholder="Nombre del representante" />
            </div>
            <div>
              <label style={labelStyle}>Fuentes de información</label>
              <textarea value={data.legalData?.sources || ''} onChange={(e) => updateData('legalData', 'sources', e.target.value)} style={{...inputStyle, minHeight: '80px'}} disabled={isReadOnly} placeholder="Links corporativos o fuentes que comprueban los datos proporcionados" />
            </div>
            
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', marginTop: '16px' }}>
              <label style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', cursor: isReadOnly ? 'not-allowed' : 'pointer' }}>
                <input type="checkbox" checked={data.legalData?.veracity_declaration || false} onChange={e => updateData('legalData', 'veracity_declaration', e.target.checked)} disabled={isReadOnly} style={{ marginTop: '4px' }}/>
                <span style={{ fontSize: '14px', lineHeight: '1.5', color: '#334155' }}>
                  <strong>Declaración de Veracidad:</strong> Declaro que la información proporcionada es correcta, está respaldada institucionalmente y no viola derechos de terceros.
                </span>
              </label>
            </div>

            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <label style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', cursor: isReadOnly ? 'not-allowed' : 'pointer' }}>
                <input type="checkbox" checked={data.legalData?.authorization || false} onChange={e => updateData('legalData', 'authorization', e.target.checked)} disabled={isReadOnly} style={{ marginTop: '4px' }}/>
                <span style={{ fontSize: '14px', lineHeight: '1.5', color: '#334155' }}>
                  <strong>Autorización de Publicación:</strong> Autorizo a ANALAC a revisar y publicar la información, imágenes y documentos contenidos en este perfil en el Directorio Inteligente.
                </span>
              </label>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// Inline Styles
const labelStyle = {
  display: 'block',
  fontSize: '14px',
  fontWeight: 600,
  marginBottom: '8px',
  color: 'var(--p-text-main)'
};

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid var(--p-border)',
  borderRadius: '6px',
  fontSize: '15px',
  fontFamily: 'inherit',
  color: 'var(--p-text-main)'
};

const reqStyle = { color: '#ef4444' };

const btnStyle = {
  padding: '8px 16px',
  background: '#f1f5f9',
  border: '1px solid #cbd5e1',
  borderRadius: '6px',
  fontSize: '14px',
  fontWeight: 500,
  cursor: 'pointer',
  color: '#334155'
};

const btnDangerStyle = {
  padding: '8px 12px',
  background: '#fee2e2',
  border: '1px solid #fecaca',
  borderRadius: '6px',
  fontSize: '14px',
  fontWeight: 600,
  cursor: 'pointer',
  color: '#dc2626'
};
