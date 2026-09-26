# SUBCONSCIOUS LOG SEO & Technical Architecture Reference

## 1. Overview & Strategy
SUBCONSCIOUS LOG's SEO architecture is designed around high-intent search exploration across oneiric science, dream journaling, universal dream symbolism, and subconscious pattern discovery.

### Public vs. Private Boundaries
- **Public (Indexable)**: 
  - Landing page (`/`)
  - Pillar pages (`/dream-journal`, `/dream-interpretation`, `/ai-dream-interpreter`, `/lucid-dreaming`, `/recurring-dreams`)
  - Symbol dictionary (`/dream-symbols`, `/dream-symbols/[slug]`)
  - Editorial Knowledge Base (`/blog`, `/blog/[slug]`)
  - Trust & Terminology (`/about`, `/glossary`, `/faq`, `/privacy`, `/terms`)
- **Private (Noindex / Blocked via Robots.txt)**:
  - User dream entries (`/dream/*`, `/dreams`)
  - The 2.5D Dream World (`/world`)
  - User Artifact Collection (`/collection`)
  - Account, settings, AI chats, and API endpoints (`/settings`, `/chat`, `/api/*`)

---

## 2. Dynamic Sitemap & Metadata Architecture
- **Sitemap**: Generated dynamically at `/sitemap.xml` with automatic priority weighting and modification timestamps.
- **Robots.txt**: Generated dynamically at `/robots.ts` with strict disallow directives for private user areas.
- **Canonicalization**: Every public page injects its own canonical URL using `constructMetadata` in `src/lib/seo/metadata.ts`.
- **OpenGraph & Twitter Cards**: Full support for 1200x630 preview cards and rich meta snippets.

---

## 3. Schema.org Structured Data
Implemented valid JSON-LD schemas:
1. **Organization**: Name, legal name, URL, and official logo.
2. **WebSite & SearchAction**: Global site search intent markup.
3. **Article / BlogPosting**: Structured articles with author, datePublished, dateModified, and publisher info.
4. **BreadcrumbList**: Hierarchical navigational trail schema on all public subpages.
5. **FAQPage**: Compliant Q&A schema on `/faq`.
