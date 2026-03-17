'use client';
/**
 * RuntimeDebugger - Main debug panel for KFlow applications
 *
 * Press backtick (`) to toggle. Displays traits, ticks, entities, events,
 * guards, verification checks, transition timeline, and server bridge health.
 *
 * @packageDocumentation
 */

import * as React from 'react';
import { cn } from '../../../lib/cn';
import { useDebugData } from './hooks/useDebugData';
import { onDebugToggle, isDebugEnabled } from '../../../lib/debugUtils';
import { Tabs, type TabItem } from '../../molecules/Tabs';
import { Button } from '../../atoms/Button';
import { Card } from '../../atoms/Card';
import { Badge } from '../../atoms/Badge';
import { Typography } from '../../atoms/Typography';
import { TraitsTab } from './tabs/TraitsTab';
import { TicksTab } from './tabs/TicksTab';
import { EntitiesTab } from './tabs/EntitiesTab';
import { EventFlowTab } from './tabs/EventFlowTab';
import { GuardsPanel } from './tabs/GuardsPanel';
import { VerificationTab } from './tabs/VerificationTab';
import { TransitionTimeline } from './tabs/TransitionTimeline';
import { ServerBridgeTab } from './tabs/ServerBridgeTab';
import './RuntimeDebugger.css';

export interface RuntimeDebuggerProps {
    /** Initial position */
    position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
    /** Initial collapsed state */
    defaultCollapsed?: boolean;
    /** Additional CSS classes */
    className?: string;
}

export function RuntimeDebugger({
    position = 'bottom-right',
    defaultCollapsed = true,
    className,
}: RuntimeDebuggerProps) {
    const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);
    const [isVisible, setIsVisible] = React.useState(isDebugEnabled());

    const debugData = useDebugData();

    // Listen for keyboard toggle
    React.useEffect(() => {
        return onDebugToggle((enabled) => {
            setIsVisible(enabled);
            if (enabled) {
                setIsCollapsed(false);
            }
        });
    }, []);

    // Keyboard shortcut to toggle collapse
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === '`' && isVisible) {
                // Don't toggle if typing in input
                const target = e.target as HTMLElement;
                if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
                setIsCollapsed(prev => !prev);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isVisible]);

    if (!isVisible) {
        return null;
    }

    const positionClasses = {
        'bottom-right': 'bottom-4 right-4',
        'bottom-left': 'bottom-4 left-4',
        'top-right': 'top-4 right-4',
        'top-left': 'top-4 left-4',
    };

    const { verification } = debugData;
    const failedChecks = verification.summary.failed;

    // Build tab items using existing Tabs molecule
    const tabItems: TabItem[] = [
        {
            id: 'verify',
            label: failedChecks > 0 ? 'Verify (!)' : 'Verify',
            badge: verification.summary.totalChecks || undefined,
            content: <VerificationTab checks={verification.checks} summary={verification.summary} />,
        },
        {
            id: 'timeline',
            label: 'Timeline',
            badge: verification.transitions.length || undefined,
            content: <TransitionTimeline transitions={verification.transitions} />,
        },
        {
            id: 'bridge',
            label: 'Bridge',
            badge: verification.bridge?.connected ? undefined : 1,
            content: <ServerBridgeTab bridge={verification.bridge} />,
        },
        {
            id: 'traits',
            label: 'Traits',
            badge: debugData.traits.length || undefined,
            content: <TraitsTab traits={debugData.traits} />,
        },
        {
            id: 'ticks',
            label: 'Ticks',
            badge: debugData.ticks.filter((t: { active: boolean }) => t.active).length || undefined,
            content: <TicksTab ticks={debugData.ticks} />,
        },
        {
            id: 'entities',
            label: 'Entities',
            badge: debugData.entitySnapshot?.runtime.length || undefined,
            content: <EntitiesTab snapshot={debugData.entitySnapshot} />,
        },
        {
            id: 'events',
            label: 'Events',
            badge: debugData.events.length > 0 ? debugData.events.length : undefined,
            content: <EventFlowTab events={debugData.events} />,
        },
        {
            id: 'guards',
            label: 'Guards',
            badge: debugData.guards.filter((g: { result: boolean }) => !g.result).length || undefined,
            content: <GuardsPanel guards={debugData.guards} />,
        },
    ];

    return (
        <div
            className={cn(
                'runtime-debugger',
                'fixed z-[9999]',
                positionClasses[position],
                isCollapsed ? 'runtime-debugger--collapsed' : 'runtime-debugger--expanded',
                className
            )}
            data-testid={isCollapsed ? 'debugger-collapsed' : 'debugger-expanded'}
        >
            {isCollapsed ? (
                <Button
                    onClick={() => setIsCollapsed(false)}
                    variant="secondary"
                    size="sm"
                    className="runtime-debugger__toggle"
                    title="Open Debugger (`)"
                >
                    {failedChecks > 0 ? (
                        <span className="relative">
                            <span>V</span>
                            <span className="absolute -top-1 -right-2 w-2 h-2 bg-red-500 rounded-full" />
                        </span>
                    ) : (
                        <span>V</span>
                    )}
                </Button>
            ) : (
                <Card className="runtime-debugger__panel">
                    {/* Header */}
                    <div className="runtime-debugger__header">
                        <div className="flex items-center gap-2">
                            <span className="text-lg">V</span>
                            <Typography variant="h6">KFlow Verifier</Typography>
                            {failedChecks > 0 ? (
                                <Badge variant="danger" size="sm">{failedChecks} failed</Badge>
                            ) : verification.summary.totalChecks > 0 ? (
                                <Badge variant="success" size="sm">All passing</Badge>
                            ) : (
                                <Badge variant="info" size="sm">Runtime</Badge>
                            )}
                        </div>
                        <Button
                            onClick={() => setIsCollapsed(true)}
                            variant="ghost"
                            size="sm"
                            title="Close (`)"
                        >
                            x
                        </Button>
                    </div>

                    {/* Tabs - using existing Tabs molecule */}
                    <div className="runtime-debugger__content">
                        <Tabs
                            items={tabItems}
                            variant="pills"
                            className="runtime-debugger__tabs"
                        />
                    </div>

                    {/* Footer */}
                    <div className="runtime-debugger__footer">
                        <Typography variant="small" className="text-gray-500">
                            Press ` to toggle | window.__orbitalVerification for automation
                        </Typography>
                    </div>
                </Card>
            )}
        </div>
    );
}

RuntimeDebugger.displayName = 'RuntimeDebugger';
