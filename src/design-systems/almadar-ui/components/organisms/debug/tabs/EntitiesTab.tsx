/**
 * EntitiesTab - Displays entity snapshots
 * Uses existing component library atoms/molecules.
 */

import * as React from 'react';
import type { EntitySnapshot } from '../../../../lib/entityDebug';
import { Accordion } from '../../../molecules/Accordion';
import { Badge } from '../../../atoms/Badge';
import { Typography } from '../../../atoms/Typography';
import { Stack } from '../../../atoms/Stack';
import { EmptyState } from '../../../molecules/EmptyState';

interface EntitiesTabProps {
    snapshot: EntitySnapshot | null;
}

export function EntitiesTab({ snapshot }: EntitiesTabProps) {
    if (!snapshot) {
        return (
            <EmptyState
                title="No entity data"
                description="Debug mode may not be enabled"
                className="py-8"
            />
        );
    }

    const singletonEntries = Object.entries(snapshot.singletons);
    const runtimeEntities = snapshot.runtime;
    const persistentEntries = Object.entries(snapshot.persistent);

    if (singletonEntries.length === 0 && runtimeEntities.length === 0 && persistentEntries.length === 0) {
        return (
            <EmptyState
                title="No entities"
                description="Entities will appear when spawned"
                className="py-8"
            />
        );
    }

    // Build accordion items for singletons
    const singletonItems = singletonEntries.map(([name, data]) => ({
        id: `singleton-${name}`,
        header: (
            <div className="flex items-center gap-2">
                <Badge variant="primary" size="sm">Singleton</Badge>
                <Typography variant="body" weight="semibold" className="text-sky-600 dark:text-sky-400">
                    {name}
                </Typography>
            </div>
        ),
        content: (
            <pre className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-2 rounded overflow-auto max-h-40">
                {JSON.stringify(data, null, 2)}
            </pre>
        ),
    }));

    // Build accordion items for runtime entities (limit to 20)
    const runtimeItems = runtimeEntities.slice(0, 20).map(entity => ({
        id: entity.id,
        header: (
            <div className="flex items-center gap-2">
                <Typography variant="body" weight="semibold" className="text-sky-600 dark:text-sky-400">
                    {entity.type}
                </Typography>
                <Typography variant="small" className="text-gray-500">
                    #{entity.id.slice(0, 8)}
                </Typography>
            </div>
        ),
        content: (
            <pre className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-2 rounded overflow-auto max-h-40">
                {JSON.stringify(entity.data, null, 2)}
            </pre>
        ),
    }));

    return (
        <div className="debug-tab debug-tab--entities">
            {/* Singletons */}
            {singletonItems.length > 0 && (
                <div className="mb-4">
                    <Typography variant="small" weight="medium" className="text-gray-500 mb-2">
                        Singletons ({singletonItems.length})
                    </Typography>
                    <Accordion items={singletonItems} multiple />
                </div>
            )}

            {/* Runtime entities */}
            {runtimeItems.length > 0 && (
                <div className="mb-4">
                    <Typography variant="small" weight="medium" className="text-gray-500 mb-2">
                        Runtime ({runtimeEntities.length})
                    </Typography>
                    <Accordion items={runtimeItems} multiple />
                    {runtimeEntities.length > 20 && (
                        <Typography variant="small" className="text-gray-400 text-center mt-2">
                            +{runtimeEntities.length - 20} more entities
                        </Typography>
                    )}
                </div>
            )}

            {/* Persistent entities */}
            {persistentEntries.length > 0 && (
                <div>
                    <Typography variant="small" weight="medium" className="text-gray-500 mb-2">
                        Persistent
                    </Typography>
                    <Stack gap="xs">
                        {persistentEntries.map(([type, info]) => (
                            <div key={type} className="flex items-center justify-between py-1">
                                <Typography variant="small">{type}</Typography>
                                <Badge variant={info.loaded ? 'success' : 'default'} size="sm">
                                    {info.loaded ? `${info.count} loaded` : 'not loaded'}
                                </Badge>
                            </div>
                        ))}
                    </Stack>
                </div>
            )}
        </div>
    );
}

EntitiesTab.displayName = 'EntitiesTab';
