/**
 * AssetLoader
 *
 * Three.js asset loading manager for 3D models and textures.
 * Supports GLB/GLTF (primary), OBJ (fallback), and texture loading.
 * Implements caching for performance.
 *
 * @packageDocumentation
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

export interface LoadedModel {
    scene: THREE.Group;
    animations: THREE.AnimationClip[];
}

/**
 * Detect the 3D asset root from a model URL.
 * Looks for "/3d/" segment and returns everything up to and including it.
 */
function detectAssetRoot(modelUrl: string): string {
    const idx = modelUrl.indexOf('/3d/');
    if (idx !== -1) {
        return modelUrl.substring(0, idx + 4);
    }
    return modelUrl.substring(0, modelUrl.lastIndexOf('/') + 1);
}

/**
 * Create a GLTFLoader with resourcePath set so that relative texture URIs
 * inside the GLTF JSON (e.g. "Textures/colormap.png") resolve against
 * the asset root directory, not the model's own subdirectory.
 */
function createGLTFLoaderForUrl(url: string): GLTFLoader {
    const loader = new GLTFLoader();
    loader.setResourcePath(detectAssetRoot(url));
    return loader;
}

export class AssetLoader {
    private objLoader: OBJLoader;
    private textureLoader: THREE.TextureLoader;
    private modelCache: Map<string, LoadedModel>;
    private textureCache: Map<string, THREE.Texture>;
    private loadingPromises: Map<string, Promise<unknown>>;

    constructor() {
        this.objLoader = new OBJLoader();
        this.textureLoader = new THREE.TextureLoader();
        this.modelCache = new Map();
        this.textureCache = new Map();
        this.loadingPromises = new Map();
    }

    /**
     * Load a GLB/GLTF model
     * @param url - URL to the .glb or .gltf file
     * @returns Promise with loaded model scene and animations
     */
    async loadModel(url: string): Promise<LoadedModel> {
        // Check cache first
        if (this.modelCache.has(url)) {
            return this.modelCache.get(url)!;
        }

        // Check if already loading
        if (this.loadingPromises.has(url)) {
            return this.loadingPromises.get(url) as Promise<LoadedModel>;
        }

        // Start loading — create a per-URL loader with correct texture resolution
        const loader = createGLTFLoaderForUrl(url);
        const loadPromise = loader
            .loadAsync(url)
            .then((gltf) => {
                const result: LoadedModel = {
                    scene: gltf.scene,
                    animations: gltf.animations || [],
                };
                this.modelCache.set(url, result);
                this.loadingPromises.delete(url);
                return result;
            })
            .catch((error) => {
                this.loadingPromises.delete(url);
                throw new Error(`Failed to load model ${url}: ${error.message}`);
            });

        this.loadingPromises.set(url, loadPromise);
        return loadPromise;
    }

    /**
     * Load an OBJ model (fallback for non-GLB assets)
     * @param url - URL to the .obj file
     * @returns Promise with loaded object group
     */
    async loadOBJ(url: string): Promise<THREE.Group> {
        // Check cache first
        if (this.modelCache.has(url)) {
            return this.modelCache.get(url)!.scene;
        }

        // Check if already loading
        if (this.loadingPromises.has(url)) {
            const result = await this.loadingPromises.get(url);
            return (result as LoadedModel).scene;
        }

        // Start loading
        const loadPromise = this.objLoader
            .loadAsync(url)
            .then((group) => {
                const result: LoadedModel = {
                    scene: group,
                    animations: [],
                };
                this.modelCache.set(url, result);
                this.loadingPromises.delete(url);
                return result;
            })
            .catch((error) => {
                this.loadingPromises.delete(url);
                throw new Error(`Failed to load OBJ ${url}: ${error.message}`);
            });

        this.loadingPromises.set(url, loadPromise);
        return (await loadPromise).scene;
    }

    /**
     * Load a texture
     * @param url - URL to the texture image
     * @returns Promise with loaded texture
     */
    async loadTexture(url: string): Promise<THREE.Texture> {
        // Check cache first
        if (this.textureCache.has(url)) {
            return this.textureCache.get(url)!;
        }

        // Check if already loading
        if (this.loadingPromises.has(`texture:${url}`)) {
            return this.loadingPromises.get(`texture:${url}`) as Promise<THREE.Texture>;
        }

        // Start loading
        const loadPromise = this.textureLoader
            .loadAsync(url)
            .then((texture) => {
                texture.colorSpace = THREE.SRGBColorSpace;
                this.textureCache.set(url, texture);
                this.loadingPromises.delete(`texture:${url}`);
                return texture;
            })
            .catch((error) => {
                this.loadingPromises.delete(`texture:${url}`);
                throw new Error(`Failed to load texture ${url}: ${error.message}`);
            });

        this.loadingPromises.set(`texture:${url}`, loadPromise);
        return loadPromise;
    }

    /**
     * Preload multiple assets
     * @param urls - Array of asset URLs to preload
     * @returns Promise that resolves when all assets are loaded
     */
    async preload(urls: string[]): Promise<void> {
        const promises = urls.map((url) => {
            if (url.endsWith('.glb') || url.endsWith('.gltf')) {
                return this.loadModel(url).catch(() => null);
            } else if (url.endsWith('.obj')) {
                return this.loadOBJ(url).catch(() => null);
            } else if (/\.(png|jpg|jpeg|webp)$/i.test(url)) {
                return this.loadTexture(url).catch(() => null);
            }
            return Promise.resolve(null);
        });

        await Promise.all(promises);
    }

    /**
     * Check if a model is cached
     * @param url - Model URL
     */
    hasModel(url: string): boolean {
        return this.modelCache.has(url);
    }

    /**
     * Check if a texture is cached
     * @param url - Texture URL
     */
    hasTexture(url: string): boolean {
        return this.textureCache.has(url);
    }

    /**
     * Get cached model (throws if not cached)
     * @param url - Model URL
     */
    getModel(url: string): LoadedModel {
        const model = this.modelCache.get(url);
        if (!model) {
            throw new Error(`Model ${url} not in cache`);
        }
        return model;
    }

    /**
     * Get cached texture (throws if not cached)
     * @param url - Texture URL
     */
    getTexture(url: string): THREE.Texture {
        const texture = this.textureCache.get(url);
        if (!texture) {
            throw new Error(`Texture ${url} not in cache`);
        }
        return texture;
    }

    /**
     * Clear all caches
     */
    clearCache(): void {
        // Dispose textures
        this.textureCache.forEach((texture) => {
            texture.dispose();
        });

        // Dispose models
        this.modelCache.forEach((model) => {
            model.scene.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    child.geometry.dispose();
                    if (Array.isArray(child.material)) {
                        child.material.forEach((m) => m.dispose());
                    } else {
                        child.material.dispose();
                    }
                }
            });
        });

        this.modelCache.clear();
        this.textureCache.clear();
        this.loadingPromises.clear();
    }

    /**
     * Get cache statistics
     */
    getStats(): { models: number; textures: number; loading: number } {
        return {
            models: this.modelCache.size,
            textures: this.textureCache.size,
            loading: this.loadingPromises.size,
        };
    }
}

// Global singleton instance
export const assetLoader = new AssetLoader();

export default AssetLoader;
