import { createConfig } from './shared/config/base-config';
import remarkLoloCompile from './shared/plugins/remark-lolo-compile';

export default createConfig({
  site: 'orb',
  url: 'https://orb.almadar.io',
  title: 'Orb',
  tagline: 'Formal world models of software',
  customCss: './src/css/custom.css',
  docs: {
    sidebarPath: './sidebars.ts',
    remarkPlugins: [remarkLoloCompile],
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
