/**
 * Linkfields CMS — Strapi 5 admin panel branding.
 *
 * - Logos: login card (navy plate with the full Linkfields logo) and main navigation (Linkfields mark).
 * - Favicon and browser-tab titles say "Linkfields CMS" instead of Strapi.
 * - Theme: Linkfields orange as the primary colour in light and dark mode (button/link shades chosen for
 *   WCAG AA contrast with white text), navy-tinted dark surfaces matching linkfields.com.
 * - Login / password pages (/admin/auth/*): dark Linkfields background with brand glows, the supplied globe
 *   artwork, a gradient-topped card, gradient sign-in button and the brand line.
 * - Strapi video tutorials and release notifications are switched off for editors.
 *
 * Assets live in ./extensions (see docs/CMS-BRANDING-AND-EMAIL.md). Rebuild the admin after changes:
 * `pnpm build` in apps/cms, then restart the lf-cms service.
 */
import type { StrapiApp } from '@strapi/strapi/admin';

import AuthLogo from './extensions/linkfields-auth-logo.svg';
import MenuLogo from './extensions/linkfields-mark.svg';
import Favicon from './extensions/linkfields-favicon.png';
import Globe from './extensions/linkfields-globe.jpg';

const BRAND = 'Linkfields CMS';

const lightColors = {
  primary100: '#FFF4EA',
  primary200: '#FFD6B0',
  primary500: '#FF7800',
  primary600: '#CC4A00',
  primary700: '#A83C00',
  buttonPrimary500: '#E05300',
  buttonPrimary600: '#CC4A00',
};

const darkColors = {
  primary100: '#2A1B10',
  primary200: '#6B3A12',
  primary500: '#FF9A3D',
  primary600: '#FF9A3D',
  primary700: '#FFB066',
  buttonPrimary500: '#E05300',
  buttonPrimary600: '#CC4A00',
  neutral0: '#131A2E',
  neutral100: '#0B1020',
  neutral150: '#222B45',
  neutral200: '#303A58',
  neutral300: '#5C6686',
  neutral400: '#A3AAC0',
  neutral500: '#8E96B0',
  neutral600: '#A3AAC0',
  neutral700: '#E3E7F0',
  neutral1000: '#070B16',
};

/** Branded styling for the unauthenticated pages only (scoped by html[data-lf-auth]). */
const authCss = `
html[data-lf-auth] body {
  min-height: 100vh;
  background:
    radial-gradient(60rem 40rem at 6% -12%, rgba(255, 120, 0, 0.22), transparent 62%),
    radial-gradient(58rem 46rem at 108% 112%, rgba(45, 88, 192, 0.34), transparent 62%),
    linear-gradient(180deg, #0b1020 0%, #070b16 100%);
  background-attachment: fixed;
}
html[data-lf-auth] body::before {
  content: "";
  position: fixed;
  right: -14rem;
  bottom: -16rem;
  width: 56rem;
  height: 56rem;
  background: url("${Globe}") center / contain no-repeat;
  mix-blend-mode: screen;
  opacity: 0.5;
  -webkit-mask-image: radial-gradient(circle at center, #000 52%, transparent 71%);
  mask-image: radial-gradient(circle at center, #000 52%, transparent 71%);
  pointer-events: none;
  z-index: 0;
}
html[data-lf-auth] body::after {
  content: "";
  position: fixed;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.035) 1px, transparent 1px);
  background-size: 56px 56px;
  -webkit-mask-image: radial-gradient(ellipse 70% 60% at 50% 40%, #000, transparent 75%);
  mask-image: radial-gradient(ellipse 70% 60% at 50% 40%, #000, transparent 75%);
  pointer-events: none;
  z-index: 0;
}
html[data-lf-auth] #strapi { position: relative; z-index: 1; }
html[data-lf-auth] main#main-content > div:first-child {
  position: relative;
  overflow: hidden;
  border-radius: 22px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 40px 90px -40px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(255, 255, 255, 0.04);
}
html[data-lf-auth] main#main-content > div:first-child::before {
  content: "";
  position: absolute;
  inset: 0 0 auto 0;
  height: 4px;
  background: linear-gradient(90deg, #ffa033 0%, #ff7800 45%, #2d58c0 100%);
}
html[data-lf-auth] main#main-content > div:first-child img { border-radius: 18px; box-shadow: 0 18px 40px -22px rgba(7, 11, 22, 0.9); }
html[data-lf-auth] main#main-content h1 { letter-spacing: -0.01em; }
html[data-lf-auth] main#main-content form button[type="submit"] {
  height: 44px;
  border: 0;
  border-radius: 12px;
  background: linear-gradient(115deg, #ff8a1f 0%, #ec5a06 50%, #cc4a00 100%);
  box-shadow: 0 14px 30px -14px rgba(255, 120, 0, 0.9), inset 0 1px 0 rgba(255, 255, 255, 0.25);
  transition: transform 200ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 240ms, filter 240ms;
}
html[data-lf-auth] main#main-content form button[type="submit"]:hover {
  transform: translateY(-1px);
  filter: brightness(1.06) saturate(1.08);
  box-shadow: 0 0 0 4px rgba(255, 140, 0, 0.18), 0 18px 36px -14px rgba(255, 120, 0, 0.95), inset 0 1px 0 rgba(255, 255, 255, 0.3);
}
html[data-lf-auth] main#main-content form button[type="submit"] span { color: #fff; font-weight: 700; letter-spacing: 0.01em; }
html[data-lf-auth] main#main-content > div:nth-child(n + 2) a,
html[data-lf-auth] main#main-content > div:nth-child(n + 2) a span { color: #ffb066; }
html[data-lf-auth] main#main-content > div:nth-child(n + 2) a:hover span { color: #ffd2a3; text-decoration: underline; text-underline-offset: 3px; }
html[data-lf-auth] main#main-content::after {
  content: "One strategic partner across your transformation";
  display: block;
  margin-top: 28px;
  text-align: center;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.45);
}
@media (prefers-reduced-motion: reduce) {
  html[data-lf-auth] main#main-content form button[type="submit"] { transition: none; }
}
`;

function installBranding() {
  if (typeof window === 'undefined' || (window as unknown as { __lfBrand?: boolean }).__lfBrand) return;
  (window as unknown as { __lfBrand?: boolean }).__lfBrand = true;

  const style = document.createElement('style');
  style.id = 'lf-admin-branding';
  style.textContent = authCss;
  document.head.appendChild(style);

  const sync = () => {
    document.documentElement.toggleAttribute('data-lf-auth', /\/auth\//.test(window.location.pathname));
    if (/Strapi/.test(document.title)) document.title = document.title.replace(/Strapi Admin|Strapi/g, BRAND);
  };
  for (const method of ['pushState', 'replaceState'] as const) {
    const original = window.history[method].bind(window.history);
    window.history[method] = ((...args: Parameters<History['pushState']>) => {
      const result = original(...args);
      queueMicrotask(sync);
      return result;
    }) as History['pushState'];
  }
  window.addEventListener('popstate', sync);
  new MutationObserver(sync).observe(document.head, { childList: true, subtree: true, characterData: true });
  sync();
}

export default {
  config: {
    auth: { logo: AuthLogo },
    menu: { logo: MenuLogo },
    head: { favicon: Favicon },
    locales: [],
    theme: {
      light: { colors: lightColors },
      dark: { colors: darkColors },
    },
    translations: {
      en: {
        'Auth.form.welcome.title': 'Welcome to Linkfields CMS',
        'Auth.form.welcome.subtitle': 'Sign in to manage the Linkfields website',
        'Auth.form.button.login': 'Sign in',
        'Auth.form.email.placeholder': 'e.g. name@linkfields.com',
        'Auth.form.register.subtitle':
          'Your credentials are only used to sign in to the Linkfields CMS. All content is stored in the Linkfields database.',
        'app.components.LeftMenu.navbrand.title': BRAND,
        'app.components.LeftMenu.navbrand.workplace': 'Website content',
        'HomePage.header.subtitle': 'Manage pages, events, insights and enquiries for linkfields.com',
      },
    },
    tutorials: false,
    notifications: { releases: false },
  },
  bootstrap(_app: StrapiApp) {
    installBranding();
  },
};
