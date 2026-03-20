import React from 'react';
import { useThemeConfig } from '@docusaurus/theme-common';
import { MarketingFooter } from '@almadar/ui/marketing';
import type { FooterLinkColumn } from '@almadar/ui/marketing';

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
    <MarketingFooter
      columns={columns}
      copyright={footer.copyright}
    />
  );
}

export default React.memo(Footer);
