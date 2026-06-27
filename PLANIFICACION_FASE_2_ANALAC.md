# Planificación Estratégica - Fase 2 del Portal ANALAC

**Fecha de Elaboración:** 26 de junio de 2026  
**Documento Técnico para:** Junta Directiva y Equipo de Desarrollo  

Este documento establece la hoja de ruta técnica para la Fase 2 del Portal Institucional de ANALAC, tomando como base las directrices del cliente y las observaciones competitivas (referente: Portal AsoJersey). El objetivo es evolucionar el actual portal informativo hacia una plataforma transaccional y de servicios para el productor lechero.

---

## 1. Contexto Competitivo (Referente: AsoJersey)
El portal de referencia destaca no por su estética visual, sino por su **arquitectura de servicios**. Las funcionalidades clave observadas que aportan valor directo al agremiado son:
- Exposición clara del Equipo Administrativo.
- Transparencia en los niveles y beneficios de Membresía.
- Pasarela de pago nativa o integrada (PSE).
- Un concentrador (Hub) de servicios en línea para autogestión de trámites.

---

## 2. Estado Actual del Proyecto (ANALAC)

### 2.1 Funcionalidades Ya Implementadas (Fase 1)
- **Portal Público Informativo:** Inicio, Quiénes Somos, Información Sectorial, Consumo Lácteo y Noticias.
- **Directorio Institucional:** Listado visual de aliados comerciales e institucionales.
- **Identidad Digital y Design System:** Estandarización visual completa, tipografía corporativa y diseño adaptativo (Responsive).
- **SEO y Rendimiento:** Base técnica en Astro, garantizando métricas perfectas de carga y posicionamiento en buscadores.

### 2.2 Funcionalidades Parcialmente Implementadas
- **Embudo de Afiliación:** Existen llamados a la acción (CTAs) estratégicamente ubicados en el Home y Footer para iniciar el proceso de afiliación, pero actualmente redirigen a la página institucional genérica en lugar de una página específica de captación.
- **Acceso Privado:** Existen accesos en la barra superior dirigidos a `portal.analac.com`, pero la transición hacia ese ecosistema no cuenta con un paso intermedio que explique las ventajas del portal.

---

## 3. Hoja de Ruta: Funcionalidades Pendientes (Fase 2)

A continuación, se detallan los módulos pendientes, su justificación y la ubicación propuesta sin romper la arquitectura existente.

### Módulo A: Planes de Membresía / Afiliación
- **Estado:** Pendiente
- **Prioridad:** Alta 🔴
- **Ubicación propuesta:** `/afiliacion` o como expansión de `/asociados-aliados`.
- **Justificación funcional:** Generar un embudo de conversión directo. El productor debe conocer los beneficios tangibles, los "tiers" (niveles) de asociación según su volumen de producción y los costos asociados antes de tomar la decisión.

### Módulo B: Checkout / Integración Pago PSE
- **Estado:** Pendiente
- **Prioridad:** Alta 🔴
- **Ubicación propuesta:** `/pagos` (Landing de checkout) o integración directa vía API en la nueva página de Membresías.
- **Justificación funcional:** Facilitar el recaudo de cuotas gremiales de forma digital, eliminando barreras de pago y fricción administrativa. Permite renovaciones automáticas o pagos rápidos de la cuota anual/mensual.

### Módulo C: Hub de Servicios en Línea
- **Estado:** Pendiente
- **Prioridad:** Media 🟡
- **Ubicación propuesta:** `/servicios`
- **Justificación funcional:** Descongestionar las líneas telefónicas del gremio ofreciendo autogestión: descarga de certificados de afiliación, estado de cuenta, formatos técnicos (PQRS) y guías de movilización o sanitarias.

### Módulo D: Directorio del Equipo Administrativo
- **Estado:** Pendiente
- **Prioridad:** Baja 🟢
- **Ubicación propuesta:** `/quienes-somos#equipo` (Como sección adicional tras la Junta Directiva).
- **Justificación funcional:** Humanizar el gremio. Proporcionar a los afiliados y aliados los contactos directos (correo corporativo, cargo) de los funcionarios operativos para agilizar la comunicación institucional.

---

## 4. Recomendación y Orden de Implementación

Para asegurar que el portal mantenga su estabilidad, se sugiere el siguiente orden cronológico y arquitectónico de ejecución:

1. **Sprint A - Arquitectura de Membresías (Prioridad Alta - Frontend):**
   * *Acción:* Diseñar y maquetar la página estática `/afiliacion` con tablas de precios y beneficios. No requiere backend, únicamente UI persuasiva.

2. **Sprint B - Integración Pago PSE (Prioridad Alta - Backend/APIs):**
   * *Acción:* Conectar los botones de la página de `/afiliacion` a una pasarela (Ej: Wompi, ePayco, PayU). Requiere credenciales comerciales e integración con la cuenta bancaria del gremio.

3. **Sprint C - Hub de Servicios (Prioridad Media - Integración Compleja):**
   * *Acción:* Desarrollar `/servicios`. Se recomienda implementar esto como una interfaz conectada al subdominio `portal.analac.com` para manejar la autenticación y las bases de datos de usuarios de manera aislada al sitio estático principal.

4. **Sprint D - Equipo Institucional (Prioridad Baja pero de Rápida Ejecución):**
   * *Acción:* Agregar la sección "Nuestro Equipo" en `quienes-somos.astro`. Es un cambio puramente de interfaz (UI) que toma poco tiempo y humaniza la organización inmediatamente.

---
*Este documento ha sido redactado salvaguardando la integridad del código fuente actual del portal y manteniendo la arquitectura base lista para escalar.*
