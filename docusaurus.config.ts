import { createConfig } from './shared/config/base-config';

export default createConfig({
  site: 'orb',
  url: 'https://orb.almadar.io',
  title: 'Orb',
  tagline: 'A programming language for humans and LLMs',
  customCss: './src/css/custom.css',
  docs: {
    sidebarPath: './sidebars.ts',
  },
  blog: {
    showReadingTime: true,
    blogSidebarCount: 0,
    feedOptions: { type: ['rss', 'atom'], xslt: true },
  },
  navbarItems: [
    { to: "/docs/getting-started/introduction", label: "Docs", position: "left" },
    { to: "/blog", label: "Blog", position: "left" },
    { to: "/downloads", label: "Downloads", position: "left" },
    { to: "/playground", label: "Playground", position: "left" },
  ],
});
