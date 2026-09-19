import type { MetadataRoute } from 'next';

import { siteConfig } from '@/lib/config';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Los informes se generan bajo demanda y caducan: indexarlos crearía
        // un número ilimitado de URLs efímeras y gastaría presupuesto de rastreo.
        disallow: ['/scan/', '/api/'],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
