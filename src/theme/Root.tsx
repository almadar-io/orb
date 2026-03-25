import React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';

const AlmadarChat = React.lazy(() => import('@shared/AlmadarChat'));
const GeometricPattern = React.lazy(() => import('@almadar/ui/marketing').then(m => ({ default: m.GeometricPattern })));

interface RootProps {
    children: React.ReactNode;
}

export default function Root({ children }: RootProps): React.JSX.Element {
    return (
        <>
            <BrowserOnly fallback={null}>
                {() => (
                    <React.Suspense fallback={null}>
                        <GeometricPattern variant="greek-key" mode="dual" opacity={0.15} className="!fixed !z-0" />
                    </React.Suspense>
                )}
            </BrowserOnly>
            {children}
            <BrowserOnly fallback={null}>
                {() => (
                    <React.Suspense fallback={null}>
                        <AlmadarChat mode="floating" />
                    </React.Suspense>
                )}
            </BrowserOnly>
        </>
    );
}
