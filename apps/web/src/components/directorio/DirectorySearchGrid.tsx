import React, { useState, useEffect, useCallback } from 'react';
import OrganizationCard from './OrganizationCard';
import type { OrganizationDTO, PaginatedDirectoryResponse } from '../../services/directory/types';
import { getOrganizations } from '../../services/directory/getOrganizations';
import { getDirectoryFilters } from '../../services/directory/getDirectoryFilters';

export default function DirectorySearchGrid() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [page, setPage] = useState(1);

  const [data, setData] = useState<PaginatedDirectoryResponse | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Inicializar estado desde URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setSearchTerm(params.get('q') || '');
      setSelectedCategory(params.get('categoria') || '');
      setSelectedRegion(params.get('region') || '');
      setPage(Number(params.get('page')) || 1);
    }
  }, []);

  // Cargar filtros dinámicos
  useEffect(() => {
    getDirectoryFilters()
      .then(filters => {
        setCategories(filters.categories);
        setRegions(filters.regions);
      })
      .catch(err => console.error("Error loading filters:", err));
  }, []);

  // Cargar datos al cambiar dependencias
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getOrganizations({
        q: searchTerm,
        category: selectedCategory,
        region: selectedRegion,
        page,
        pageSize: 12
      });
      setData(result);
      
      // Actualizar URL
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        if (searchTerm) url.searchParams.set('q', searchTerm);
        else url.searchParams.delete('q');
        
        if (selectedCategory) url.searchParams.set('categoria', selectedCategory);
        else url.searchParams.delete('categoria');
        
        if (selectedRegion) url.searchParams.set('region', selectedRegion);
        else url.searchParams.delete('region');
        
        if (page > 1) url.searchParams.set('page', String(page));
        else url.searchParams.delete('page');

        window.history.replaceState({}, '', url.toString());
      }
    } catch (err) {
      setError("Ocurrió un error al cargar el directorio. Por favor, intenta de nuevo más tarde.");
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, selectedCategory, selectedRegion, page]);

  useEffect(() => {
    // Debounce para el input de búsqueda
    const timer = setTimeout(() => {
      fetchData();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchData]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedRegion('');
    setPage(1);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
      
      {/* Search & Filters */}
      <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', marginBottom: '40px', border: '1px solid rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          
          <div style={{ flex: '1 1 300px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#555', marginBottom: '8px' }}>Buscar organización o producto</label>
            <div style={{ position: 'relative' }}>
              <svg style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <input 
                type="text" 
                placeholder="Ej. Lácteos, maquinaria, vacunas..." 
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setPage(1); }}
                style={{ width: '100%', padding: '14px 16px 14px 44px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '15px', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div style={{ flex: '1 1 200px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#555', marginBottom: '8px' }}>Categoría</label>
            <select 
              value={selectedCategory} 
              onChange={e => { setSelectedCategory(e.target.value); setPage(1); }}
              style={{ width: '100%', padding: '14px 16px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '15px', backgroundColor: '#fff', boxSizing: 'border-box' }}
            >
              <option value="">Todas</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          <div style={{ flex: '1 1 200px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#555', marginBottom: '8px' }}>Región</label>
            <select 
              value={selectedRegion} 
              onChange={e => { setSelectedRegion(e.target.value); setPage(1); }}
              style={{ width: '100%', padding: '14px 16px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '15px', backgroundColor: '#fff', boxSizing: 'border-box' }}
            >
              <option value="">Nacional</option>
              {regions.map(reg => <option key={reg} value={reg}>{reg}</option>)}
            </select>
          </div>

        </div>
      </div>

      {/* Results Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--c-green-deep)' }}>
          {isLoading ? 'Cargando organizaciones...' : `${data?.total || 0} organizaciones encontradas`}
        </h2>
      </div>

      {/* Error State */}
      {error && (
         <div style={{ textAlign: 'center', padding: '40px 20px', background: '#fff0f0', color: '#d32f2f', borderRadius: '12px', border: '1px solid #ffcdd2' }}>
           <p style={{ fontWeight: 600 }}>{error}</p>
         </div>
      )}

      {/* Loading Skeletons */}
      {isLoading && !error && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
           {[1,2,3,4,5,6].map(i => (
             <div key={i} style={{ height: '300px', background: '#f5f5f5', borderRadius: '20px', animation: 'pulse 1.5s infinite' }} />
           ))}
        </div>
      )}

      {/* Grid */}
      {!isLoading && !error && data && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
            {data.data.map(org => (
              <OrganizationCard key={org.id} organization={org} />
            ))}
            
            {data.data.length === 0 && (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: '16px', border: '1px dashed #ccc' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#999', marginBottom: '16px', display: 'inline-block' }}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#555', marginBottom: '8px' }}>No encontramos resultados</h3>
                <p style={{ color: '#777' }}>Intenta ajustar tus filtros o probar con otros términos de búsqueda.</p>
                <button onClick={handleClearFilters} style={{ marginTop: '20px', background: 'transparent', border: '1px solid var(--c-green)', color: 'var(--c-green)', padding: '8px 24px', borderRadius: '100px', cursor: 'pointer', fontWeight: 600 }}>Limpiar filtros</button>
              </div>
            )}
          </div>

          {/* Paginación */}
          {data.totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '40px' }}>
              <button 
                disabled={page === 1} 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #ddd', background: page === 1 ? '#f5f5f5' : '#fff', cursor: page === 1 ? 'not-allowed' : 'pointer' }}
              >
                Anterior
              </button>
              <span style={{ fontSize: '14px', color: '#555', fontWeight: 600 }}>
                Página {page} de {data.totalPages}
              </span>
              <button 
                disabled={page === data.totalPages} 
                onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #ddd', background: page === data.totalPages ? '#f5f5f5' : '#fff', cursor: page === data.totalPages ? 'not-allowed' : 'pointer' }}
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}
      
      <style>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
