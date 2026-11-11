import type { APIRoute } from 'astro';
import { getProjects, getLab } from '../lib/data';

export const GET: APIRoute = async ({ site }) => {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const paths = [
    '/',
    '/work/',
    ...(await getProjects()).map((p) => `/work/${p.data.slug}/`),
    '/lab/',
    ...(await getLab()).map((l) => `/lab/${l.data.slug}/`),
    '/about/',
    '/colophon/',
  ];
  const urls = paths.map((p) => `  <url><loc>${new URL(base + p, site).href}</loc></url>`).join('\n');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`, {
    headers: { 'Content-Type': 'application/xml' },
  });
};
