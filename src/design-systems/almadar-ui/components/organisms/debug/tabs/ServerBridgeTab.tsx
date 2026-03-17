'use client';
/**
 * ServerBridgeTab - Displays ServerBridge health and connectivity status
 *
 * Shows:
 * - Connection status (connected/disconnected)
 * - Events forwarded (client → server) count
 * - Events received (server → client) count
 * - Last error if any
 * - Last heartbeat timestamp
 */

import * as React from 'react';
import type { BridgeHealth } from '../../../../lib/verificationRegistry';
import { Badge } from '../../../atoms/Badge';
import { Typography } from '../../../atoms/Typography';
import { Stack } from '../../../atoms/Stack';
import { Card } from '../../../atoms/Card';
import { EmptyState } from '../../../molecules/EmptyState';

interface ServerBridgeTabProps {
    bridge: BridgeHealth | null;
}

function StatRow({ label, value, variant }: {
    label: string;
    value: string | number;
    variant?: 'success' | 'danger' | 'warning' | 'default';
}) {
    return (
        <div className="flex items-center justify-between py-1.5 border-b border-gray-100 dark:border-gray-800 last:border-b-0">
            <Typography variant="small" className="text-gray-500">
                {label}
            </Typography>
            {variant ? (
                <Badge variant={variant} size="sm">{String(value)}</Badge>
            ) : (
                <Typography variant="small" weight="semibold" className="font-mono">
                    {String(value)}
                </Typography>
            )}
        </div>
    );
}

export function ServerBridgeTab({ bridge }: ServerBridgeTabProps) {
    if (!bridge) {
        return (
            <EmptyState
                title="No bridge data"
                description="The ServerBridge has not been initialized. Bridge health will appear once the runtime connects to the server."
                className="py-8"
            />
        );
    }

    const formatTime = (ts: number) => {
        if (ts === 0) return 'Never';
        const d = new Date(ts);
        return d.toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    };

    return (
        <div className="debug-tab debug-tab--bridge">
            <Stack gap="sm">
                {/* Connection Status */}
                <Card className="p-3">
                    <div className="flex items-center gap-3 mb-3">
                        <div className={`w-3 h-3 rounded-full ${bridge.connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                        <Typography variant="h6">
                            {bridge.connected ? 'Connected' : 'Disconnected'}
                        </Typography>
                    </div>

                    <Stack gap="xs">
                        <StatRow
                            label="Status"
                            value={bridge.connected ? 'Connected' : 'Disconnected'}
                            variant={bridge.connected ? 'success' : 'danger'}
                        />
                        <StatRow
                            label="Events Forwarded (Client → Server)"
                            value={bridge.eventsForwarded}
                        />
                        <StatRow
                            label="Events Received (Server → Client)"
                            value={bridge.eventsReceived}
                        />
                        <StatRow
                            label="Last Heartbeat"
                            value={formatTime(bridge.lastHeartbeat)}
                        />
                    </Stack>
                </Card>

                {/* Error Display */}
                {bridge.lastError && (
                    <Card className="p-3 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950">
                        <Typography variant="small" weight="semibold" className="text-red-600 dark:text-red-400 mb-1">
                            Last Error
                        </Typography>
                        <Typography variant="small" className="text-red-500 font-mono break-all">
                            {bridge.lastError}
                        </Typography>
                    </Card>
                )}

                {/* Throughput indicator */}
                {bridge.connected && (
                    <div className="text-center py-2">
                        <Typography variant="small" className="text-gray-400">
                            {bridge.eventsForwarded + bridge.eventsReceived} total events processed
                        </Typography>
                    </div>
                )}
            </Stack>
        </div>
    );
}

ServerBridgeTab.displayName = 'ServerBridgeTab';
