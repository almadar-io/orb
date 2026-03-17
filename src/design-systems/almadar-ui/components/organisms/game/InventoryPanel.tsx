'use client';
/**
 * InventoryPanel Component
 *
 * Grid-based inventory UI with item selection and tooltips.
 *
 * **State categories (closed-circuit compliant):**
 * - Data (items, slots, selectedSlot) → received via props
 * - UI-transient (hoveredSlot, tooltipPosition) → local only
 * - Events → emitted via `useEventBus()` (selectSlot, useItem, dropItem)
 *
 * Local state is hover/tooltip only — rendering-only concerns.
 */

import React, { useState, useCallback } from 'react';
import { cn } from '../../../lib/cn';
import { useEventBus } from '../../../hooks/useEventBus';

export interface InventoryItem {
  id: string;
  type: string;
  quantity: number;
  sprite?: string;
  name?: string;
  description?: string;
}

export interface InventoryPanelProps {
  /** Array of items in inventory */
  items: InventoryItem[];
  /** Total number of slots */
  slots: number;
  /** Number of columns in grid */
  columns: number;
  /** Currently selected slot index */
  selectedSlot?: number;
  /** Called when a slot is selected */
  onSelectSlot?: (index: number) => void;
  /** Called when an item is used (double-click or Enter) */
  onUseItem?: (item: InventoryItem) => void;
  /** Called when an item is dropped */
  onDropItem?: (item: InventoryItem) => void;
  /** Declarative event: emits UI:{selectSlotEvent} with { index } when a slot is selected */
  selectSlotEvent?: string;
  /** Declarative event: emits UI:{useItemEvent} with { item } when an item is used */
  useItemEvent?: string;
  /** Declarative event: emits UI:{dropItemEvent} with { item } when an item is dropped */
  dropItemEvent?: string;
  /** Show item tooltips on hover */
  showTooltips?: boolean;
  /** Optional className */
  className?: string;
  /** Slot size in pixels */
  slotSize?: number;
}

/**
 * Inventory panel component with grid layout
 *
 * @example
 * ```tsx
 * <InventoryPanel
 *   items={playerInventory}
 *   slots={20}
 *   columns={5}
 *   selectedSlot={selectedSlot}
 *   onSelectSlot={setSelectedSlot}
 *   onUseItem={(item) => console.log('Used:', item.name)}
 *   showTooltips
 * />
 * ```
 */
export function InventoryPanel({
  items,
  slots,
  columns,
  selectedSlot,
  onSelectSlot,
  onUseItem,
  onDropItem,
  selectSlotEvent,
  useItemEvent,
  dropItemEvent,
  showTooltips = true,
  className,
  slotSize = 48,
}: InventoryPanelProps): React.JSX.Element {
  const eventBus = useEventBus();
  const [hoveredSlot, setHoveredSlot] = useState<number | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Create slot array with items mapped to indices
  const slotArray = Array.from({ length: slots }, (_, index) => {
    return items[index] ?? null;
  });

  const rows = Math.ceil(slots / columns);

  const handleSlotClick = useCallback((index: number) => {
    if (selectSlotEvent) eventBus.emit(`UI:${selectSlotEvent}`, { index });
    onSelectSlot?.(index);
  }, [onSelectSlot, selectSlotEvent, eventBus]);

  const handleSlotDoubleClick = useCallback((index: number) => {
    const item = slotArray[index];
    if (item) {
      if (useItemEvent) eventBus.emit(`UI:${useItemEvent}`, { item });
      onUseItem?.(item);
    }
  }, [slotArray, onUseItem, useItemEvent, eventBus]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, index: number) => {
    const item = slotArray[index];

    switch (e.key) {
      case 'Enter':
      case ' ':
        if (item) {
          e.preventDefault();
          if (useItemEvent) eventBus.emit(`UI:${useItemEvent}`, { item });
          onUseItem?.(item);
        }
        break;
      case 'Delete':
      case 'Backspace':
        if (item) {
          e.preventDefault();
          if (dropItemEvent) eventBus.emit(`UI:${dropItemEvent}`, { item });
          onDropItem?.(item);
        }
        break;
      case 'ArrowRight':
        e.preventDefault();
        onSelectSlot?.(Math.min(index + 1, slots - 1));
        break;
      case 'ArrowLeft':
        e.preventDefault();
        onSelectSlot?.(Math.max(index - 1, 0));
        break;
      case 'ArrowDown':
        e.preventDefault();
        onSelectSlot?.(Math.min(index + columns, slots - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        onSelectSlot?.(Math.max(index - columns, 0));
        break;
    }
  }, [slotArray, onUseItem, onDropItem, onSelectSlot, columns, slots, useItemEvent, dropItemEvent, eventBus]);

  const handleMouseEnter = useCallback((e: React.MouseEvent, index: number) => {
    if (showTooltips && slotArray[index]) {
      setHoveredSlot(index);
      setTooltipPosition({
        x: e.clientX + 10,
        y: e.clientY + 10,
      });
    }
  }, [showTooltips, slotArray]);

  const handleMouseLeave = useCallback(() => {
    setHoveredSlot(null);
  }, []);

  const hoveredItem = hoveredSlot !== null ? slotArray[hoveredSlot] : null;

  return (
    <div className={cn('relative', className)}>
      {/* Inventory Grid */}
      <div
        className="grid gap-1 bg-gray-900 p-2 rounded-lg border border-gray-700"
        style={{
          gridTemplateColumns: `repeat(${columns}, ${slotSize}px)`,
          gridTemplateRows: `repeat(${rows}, ${slotSize}px)`,
        }}
      >
        {slotArray.map((item, index) => (
          <button
            key={index}
            type="button"
            className={cn(
              'relative flex items-center justify-center',
              'bg-gray-800 border rounded transition-colors',
              'hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500',
              selectedSlot === index
                ? 'border-yellow-400 bg-gray-700'
                : 'border-gray-600'
            )}
            style={{ width: slotSize, height: slotSize }}
            onClick={() => handleSlotClick(index)}
            onDoubleClick={() => handleSlotDoubleClick(index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onMouseEnter={(e) => handleMouseEnter(e, index)}
            onMouseLeave={handleMouseLeave}
            tabIndex={0}
            aria-label={item ? `${item.name || item.type}, quantity: ${item.quantity}` : `Empty slot ${index + 1}`}
          >
            {item && (
              <>
                {/* Item sprite or placeholder */}
                {item.sprite ? (
                  <img
                    src={item.sprite}
                    alt={item.name || item.type}
                    className="w-8 h-8 object-contain"
                    style={{ imageRendering: 'pixelated' }}
                  />
                ) : (
                  <div className="w-8 h-8 bg-gray-600 rounded flex items-center justify-center text-xs text-gray-300">
                    {item.type.charAt(0).toUpperCase()}
                  </div>
                )}

                {/* Quantity badge */}
                {item.quantity > 1 && (
                  <span className="absolute bottom-0 right-0 bg-black bg-opacity-70 text-white text-xs px-1 rounded-tl">
                    {item.quantity}
                  </span>
                )}
              </>
            )}
          </button>
        ))}
      </div>

      {/* Tooltip */}
      {showTooltips && hoveredItem && (
        <div
          className="fixed z-50 bg-gray-900 border border-gray-600 rounded-lg p-2 shadow-lg pointer-events-none"
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y,
            maxWidth: 200,
          }}
        >
          <div className="font-semibold text-white">
            {hoveredItem.name || hoveredItem.type}
          </div>
          {hoveredItem.description && (
            <div className="text-sm text-gray-400 mt-1">
              {hoveredItem.description}
            </div>
          )}
          <div className="text-xs text-gray-500 mt-1">
            Quantity: {hoveredItem.quantity}
          </div>
        </div>
      )}
    </div>
  );
}

export default InventoryPanel;
