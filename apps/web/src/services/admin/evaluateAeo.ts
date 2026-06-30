export function evaluateProfileSeoAeoQuality(data: any) {
  let score = 100;
  const warnings: string[] = [];
  const errors: string[] = [];
  const recommendations: string[] = [];

  // 1. Resumen y Descripción (AEO)
  const summary = data.summaryData?.summary || '';
  if (!summary) {
    score -= 30;
    errors.push('Falta el resumen AEO. Es obligatorio para la comprensión de motores de respuesta.');
  } else if (summary.length < 50) {
    score -= 10;
    warnings.push('El resumen es muy corto. Debería tener al menos 50 caracteres para ser un buen fragmento de respuesta.');
  } else if (summary.length > 300) {
    score -= 5;
    warnings.push('El resumen supera los 300 caracteres, podría ser truncado por Google.');
  }

  // 2. Ubicación
  if (!data.locationData?.city || !data.locationData?.department) {
    score -= 15;
    errors.push('Falta ciudad o departamento, penaliza el Local SEO y GEO.');
  }

  // 3. Productos / Servicios
  const hasProducts = data.products && data.products.length > 0;
  const hasCategories = data.categories && data.categories.length > 0;
  
  if (!hasCategories) {
    score -= 10;
    errors.push('No hay categorías asociadas.');
  }
  
  if (!hasProducts) {
    score -= 10;
    warnings.push('No se han listado productos. Los motores de respuesta priorizan perfiles con ofertas detalladas.');
  }

  // 4. Medios Visuales (Schema ImageObject)
  if (!data.basicInfo?.logo_url) {
    score -= 10;
    errors.push('Falta el logo de la empresa. Requerido para el Schema.org Organization.');
  }

  // 5. Contacto (Schema ContactPoint)
  if (!data.contactData?.email && !data.contactData?.phone) {
    score -= 10;
    warnings.push('No hay correo ni teléfono público. El Schema de ContactPoint no se generará completo.');
  }

  // 6. FAQs (Schema FAQPage)
  if (!data.faqs || data.faqs.length === 0) {
    recommendations.push('Añadir Preguntas Frecuentes (FAQs) habilitaría el rich snippet de FAQPage en los resultados de Google.');
  } else if (data.faqs.length < 2) {
    warnings.push('Recomendamos tener al menos 2 o 3 FAQs para maximizar el espacio en la SERP (Resultados de Búsqueda).');
  }

  return {
    score: Math.max(0, score),
    errors,
    warnings,
    recommendations
  };
}
