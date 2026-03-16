import React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';

const AlmadarChat = React.lazy(() => import('@shared/AlmadarChat'));

interface RootProps {
    children: React.ReactNode;
}

export default function Root({ children }: RootProps): React.JSX.Element {
    return (
        <>
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
