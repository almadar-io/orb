'use client';
/**
 * useImageCache Hook
 *
 * Preloads and caches images by URL for canvas rendering.
 * Returns a getter function that returns loaded HTMLImageElement instances.
 * Tracks loading progress to support isLoading state.
 *
 * @packageDocumentation
 */

import { useRef, useEffect, useState, useCallback } from 'react';

interface ImageCacheResult {
    /** Get a cached image by URL. Returns undefined if not yet loaded. */
    getImage: (url: string) => HTMLImageElement | undefined;
    /** Whether all requested images have loaded */
    isLoaded: boolean;
    /** Number of images currently loading */
    pendingCount: number;
}

/**
 * Preload and cache images for canvas rendering.
 *
 * @param urls - Array of image URLs to preload
 * @returns Cache getter, loading state, and pending count
 */
export function useImageCache(urls: string[]): ImageCacheResult {
    const cacheRef = useRef<Map<string, HTMLImageElement>>(new Map());
    const loadingRef = useRef<Set<string>>(new Set());
    const [pendingCount, setPendingCount] = useState(0);

    useEffect(() => {
        const cache = cacheRef.current;
        const loading = loadingRef.current;
        let cancelled = false;

        // Collect URLs that aren't already cached or loading
        const newUrls = urls.filter(url => url && !cache.has(url) && !loading.has(url));

        if (newUrls.length === 0) return;

        setPendingCount(prev => prev + newUrls.length);

        for (const url of newUrls) {
            loading.add(url);
            const img = new Image();
            img.crossOrigin = 'anonymous';

            img.onload = () => {
                if (cancelled) return;
                cache.set(url, img);
                loading.delete(url);
                setPendingCount(prev => Math.max(0, prev - 1));
            };

            img.onerror = () => {
                if (cancelled) return;
                loading.delete(url);
                setPendingCount(prev => Math.max(0, prev - 1));
            };

            img.src = url;
        }

        return () => {
            cancelled = true;
        };
    }, [urls.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

    const getImage = useCallback((url: string): HTMLImageElement | undefined => {
        return cacheRef.current.get(url);
    }, []);

    return {
        getImage,
        isLoaded: pendingCount === 0,
        pendingCount,
    };
}
