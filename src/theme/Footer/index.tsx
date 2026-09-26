import React from 'react';
import { useThemeConfig } from '@docusaurus/theme-common';
import { SiteFooter } from '../../../shared/components/sections';
import type { FooterLinkColumn } from '../../../shared/components/sections';

function Footer(): React.JSX.Element | null {
  const { footer } = useThemeConfig();
  if (!footer) return null;

  const columns: FooterLinkColumn[] = (footer.links || []).map((col: any) => ({
    title: col.title || '',
    items: (col.items || []).map((item: any) => ({
      label: item.label || '',
      href: item.href || item.to || '#',
    })),
  }));

  return (
    <SiteFooter
      columns={columns}
      copyright={footer.copyright}
    />
  );
}

export default React.memo(Footer);
