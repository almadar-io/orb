'use client';
/**
 * useAssetLoader
 *
 * React hook for loading 3D assets (GLB/OBJ/Textures) with progress tracking.
 * Wraps the AssetLoader class for React integration.
 *
 * @packageDocumentation
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import * as THREE from 'three';
import { AssetLoader, LoadedModel } from '../loaders/AssetLoader';

export interface UseAssetLoaderOptions {
    /** URLs to preload on mount */
    preloadUrls?: string[];
    /** Asset loader instance (uses singleton if not provided) */
    loader?: AssetLoader;
}

export interface AssetLoadingState {
    /** Whether assets are currently loading */
    isLoading: boolean;
    /** Loading progress (0-100) */
    progress: number;
    /** Number of loaded assets */
    loaded: number;
    /** Total assets to load */
    total: number;
    /** Any loading errors */
    errors: string[];
}

export interface UseAssetLoaderReturn extends AssetLoadingState {
    /** Load a single model */
    loadModel: (url: string) => Promise<LoadedModel>;
    /** Load a single OBJ model */
    loadOBJ: (url: string) => Promise<THREE.Group>;
    /** Load a single texture */
    loadTexture: (url: string) => Promise<THREE.Texture>;
    /** Preload multiple assets */
    preload: (urls: string[]) => Promise<void>;
    /** Check if model is cached */
    hasModel: (url: string) => boolean;
    /** Check if texture is cached */
    hasTexture: (url: string) => boolean;
    /** Get cached model */
    getModel: (url: string) => LoadedModel | undefined;
    /** Get cached texture */
    getTexture: (url: string) => THREE.Texture | undefined;
    /** Clear all caches */
    clearCache: () => void;
}

/**
 * Hook for managing 3D asset loading in React components
 *
 * @example
 * ```tsx
 * const { loadModel, isLoading, progress } = useAssetLoader({
 *     preloadUrls: ['/assets/model.glb']
 * });
 *
 * useEffect(() => {
 *     loadModel('/assets/character.glb').then((model) => {
 *         scene.add(model.scene);
 *     });
 * }, []);
 * ```
 */
export function useAssetLoader(options: UseAssetLoaderOptions = {}): UseAssetLoaderReturn {
    const { preloadUrls = [], loader: customLoader } = options;
    const loaderRef = useRef(customLoader || new AssetLoader());

    const [state, setState] = useState<AssetLoadingState>({
        isLoading: false,
        progress: 0,
        loaded: 0,
        total: 0,
        errors: [],
    });

    // Preload assets on mount
    useEffect(() => {
        if (preloadUrls.length > 0) {
            preload(preloadUrls);
        }
    }, []);

    const updateProgress = useCallback((loaded: number, total: number) => {
        setState((prev) => ({
            ...prev,
            loaded,
            total,
            progress: total > 0 ? Math.round((loaded / total) * 100) : 0,
        }));
    }, []);

    const loadModel = useCallback(
        async (url: string): Promise<LoadedModel> => {
            setState((prev) => ({ ...prev, isLoading: true }));
            try {
                const model = await loaderRef.current.loadModel(url);
                setState((prev) => ({
                    ...prev,
                    isLoading: false,
                    loaded: prev.loaded + 1,
                }));
                return model;
            } catch (error) {
                const errorMsg = error instanceof Error ? error.message : String(error);
                setState((prev) => ({
                    ...prev,
                    isLoading: false,
                    errors: [...prev.errors, errorMsg],
                }));
                throw error;
            }
        },
        []
    );

    const loadOBJ = useCallback(
        async (url: string): Promise<THREE.Group> => {
            setState((prev) => ({ ...prev, isLoading: true }));
            try {
                const model = await loaderRef.current.loadOBJ(url);
                setState((prev) => ({
                    ...prev,
                    isLoading: false,
                    loaded: prev.loaded + 1,
                }));
                return model;
            } catch (error) {
                const errorMsg = error instanceof Error ? error.message : String(error);
                setState((prev) => ({
                    ...prev,
                    isLoading: false,
                    errors: [...prev.errors, errorMsg],
                }));
                throw error;
            }
        },
        []
    );

    const loadTexture = useCallback(
        async (url: string): Promise<THREE.Texture> => {
            setState((prev) => ({ ...prev, isLoading: true }));
            try {
                const texture = await loaderRef.current.loadTexture(url);
                setState((prev) => ({
                    ...prev,
                    isLoading: false,
                    loaded: prev.loaded + 1,
                }));
                return texture;
            } catch (error) {
                const errorMsg = error instanceof Error ? error.message : String(error);
                setState((prev) => ({
                    ...prev,
                    isLoading: false,
                    errors: [...prev.errors, errorMsg],
                }));
                throw error;
            }
        },
        []
    );

    const preload = useCallback(
        async (urls: string[]): Promise<void> => {
            setState((prev) => ({
                ...prev,
                isLoading: true,
                total: urls.length,
                loaded: 0,
                errors: [],
            }));

            let completed = 0;
            const errors: string[] = [];

            await Promise.all(
                urls.map(async (url) => {
                    try {
                        if (url.endsWith('.glb') || url.endsWith('.gltf')) {
                            await loaderRef.current.loadModel(url);
                        } else if (url.endsWith('.obj')) {
                            await loaderRef.current.loadOBJ(url);
                        } else if (/\.(png|jpg|jpeg|webp)$/i.test(url)) {
                            await loaderRef.current.loadTexture(url);
                        }
                        completed++;
                        updateProgress(completed, urls.length);
                    } catch (error) {
                        const errorMsg = error instanceof Error ? error.message : String(error);
                        errors.push(`${url}: ${errorMsg}`);
                        completed++;
                        updateProgress(completed, urls.length);
                    }
                })
            );

            setState((prev) => ({
                ...prev,
                isLoading: false,
                errors,
            }));
        },
        [updateProgress]
    );

    const hasModel = useCallback((url: string): boolean => {
        return loaderRef.current.hasModel(url);
    }, []);

    const hasTexture = useCallback((url: string): boolean => {
        return loaderRef.current.hasTexture(url);
    }, []);

    const getModel = useCallback((url: string): LoadedModel | undefined => {
        try {
            return loaderRef.current.getModel(url);
        } catch {
            return undefined;
        }
    }, []);

    const getTexture = useCallback((url: string): THREE.Texture | undefined => {
        try {
            return loaderRef.current.getTexture(url);
        } catch {
            return undefined;
        }
    }, []);

    const clearCache = useCallback((): void => {
        loaderRef.current.clearCache();
        setState({
            isLoading: false,
            progress: 0,
            loaded: 0,
            total: 0,
            errors: [],
        });
    }, []);

    return {
        ...state,
        loadModel,
        loadOBJ,
        loadTexture,
        preload,
        hasModel,
        hasTexture,
        getModel,
        getTexture,
        clearCache,
    };
}

export default useAssetLoader;
