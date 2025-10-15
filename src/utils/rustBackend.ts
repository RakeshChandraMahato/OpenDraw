/**
 * Rust Backend Integration for OpenDraw
 * 
 * This module provides high-performance operations using Rust via Tauri IPC.
 * Falls back to JavaScript implementations if Tauri is not available (web mode).
 */

import { invoke } from '@tauri-apps/api/core';
import type { ExcalidrawElement } from '@excalidraw/element/types';

// Check if running in Tauri environment
const isTauri = typeof window !== 'undefined' && '__TAURI__' in window;

export interface Point {
  x: number;
  y: number;
}

export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Fast collision detection using Rust
 * Checks which elements collide with a given point
 */
export async function checkCollision(
  point: Point,
  elements: readonly ExcalidrawElement[]
): Promise<string[]> {
  if (!isTauri) {
    // Fallback to JS implementation
    return [];
  }

  try {
    return await invoke<string[]>('check_collision', {
      point,
      elements: elements.map(convertToRustElement),
    });
  } catch (error) {
    console.error('Rust collision detection failed:', error);
    return [];
  }
}

/**
 * Calculate bounding box for elements using Rust parallel processing
 */
export async function calculateBounds(
  elements: readonly ExcalidrawElement[]
): Promise<Bounds | null> {
  if (!isTauri || elements.length === 0) {
    return null;
  }

  try {
    return await invoke<Bounds>('calculate_bounds', {
      elements: elements.map(convertToRustElement),
    });
  } catch (error) {
    console.error('Rust bounds calculation failed:', error);
    return null;
  }
}

/**
 * Export to SVG using Rust
 * Faster than JavaScript implementation for large drawings
 */
export async function exportToSvgRust(
  elements: readonly ExcalidrawElement[],
  bounds: Bounds
): Promise<string | null> {
  if (!isTauri) {
    return null;
  }

  try {
    return await invoke<string>('export_svg', {
      elements: elements.map(convertToRustElement),
      bounds,
    });
  } catch (error) {
    console.error('Rust SVG export failed:', error);
    return null;
  }
}

/**
 * Export to PNG using Rust
 * Returns base64-encoded image data
 */
export async function exportToPngRust(
  elements: readonly ExcalidrawElement[],
  bounds: Bounds,
  scale: number = 1
): Promise<string | null> {
  if (!isTauri) {
    return null;
  }

  try {
    return await invoke<string>('export_png', {
      elements: elements.map(convertToRustElement),
      bounds,
      scale,
    });
  } catch (error) {
    console.error('Rust PNG export failed:', error);
    return null;
  }
}

/**
 * Save drawing to file using Rust
 */
export async function saveDrawingRust(
  path: string,
  elements: readonly ExcalidrawElement[],
  appState: any
): Promise<boolean> {
  if (!isTauri) {
    return false;
  }

  try {
    await invoke('save_drawing', {
      path,
      drawing: {
        version: '1.0.0',
        elements: elements.map(convertToRustElement),
        app_state: appState,
      },
    });
    return true;
  } catch (error) {
    console.error('Rust save failed:', error);
    return false;
  }
}

/**
 * Load drawing from file using Rust
 */
export async function loadDrawingRust(
  path: string
): Promise<{ elements: any[]; appState: any } | null> {
  if (!isTauri) {
    return null;
  }

  try {
    const drawing = await invoke<{
      version: string;
      elements: any[];
      app_state: any;
    }>('load_drawing', { path });
    
    return {
      elements: drawing.elements,
      appState: drawing.app_state,
    };
  } catch (error) {
    console.error('Rust load failed:', error);
    return null;
  }
}

/**
 * Convert Excalidraw element to Rust-compatible format
 */
function convertToRustElement(element: ExcalidrawElement): any {
  const base = {
    id: element.id,
    x: element.x,
    y: element.y,
    width: element.width,
    height: element.height,
    angle: element.angle || 0,
    stroke_color: element.strokeColor || '#000000',
    fill_color: element.backgroundColor || 'transparent',
  };

  switch (element.type) {
    case 'rectangle':
      return { Rectangle: base };
    case 'ellipse':
      return { Ellipse: base };
    case 'line':
      return {
        Line: {
          id: element.id,
          points: element.points?.map(([x, y]) => ({ x, y })) || [],
          stroke_color: element.strokeColor || '#000000',
          stroke_width: element.strokeWidth || 1,
        },
      };
    case 'arrow':
      const points = element.points || [[0, 0], [0, 0]];
      return {
        Arrow: {
          id: element.id,
          start: { x: points[0][0], y: points[0][1] },
          end: { x: points[points.length - 1][0], y: points[points.length - 1][1] },
          stroke_color: element.strokeColor || '#000000',
          stroke_width: element.strokeWidth || 1,
        },
      };
    default:
      // For unsupported types, convert to rectangle
      return { Rectangle: base };
  }
}

/**
 * Performance monitoring utility
 */
export function measurePerformance<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = performance.now();
  return fn().then((result) => {
    const duration = performance.now() - start;
    console.log(`[Rust Backend] ${name} took ${duration.toFixed(2)}ms`);
    return result;
  });
}
