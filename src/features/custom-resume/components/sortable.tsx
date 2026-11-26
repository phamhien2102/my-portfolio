"use client";

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { DraggableAttributes, DraggableSyntheticListeners } from "@dnd-kit/core";
import { useId, type CSSProperties, type ReactNode } from "react";

import { Icon } from "./fields";

export interface HandleProps {
  attributes: DraggableAttributes;
  listeners: DraggableSyntheticListeners;
  setActivatorNodeRef: (el: HTMLElement | null) => void;
}

/** A vertical list the person can reorder by dragging a handle, or with the keyboard. */
export function SortableList<T extends { id: string }>({
  items,
  onMove,
  render,
  label,
}: {
  items: T[];
  onMove: (from: number, to: number) => void;
  render: (item: T, handle: ReactNode, dragging: boolean) => ReactNode;
  label: string;
}) {
  const dndId = useId();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const onDragEnd = (e: DragEndEvent) => {
    if (!e.over || e.active.id === e.over.id) return;
    const from = items.findIndex((i) => i.id === e.active.id);
    const to = items.findIndex((i) => i.id === e.over!.id);
    onMove(from, to);
  };
  return (
    <DndContext
      id={dndId}
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
    >
      <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {items.map((item) => (
            <Row key={item.id} id={item.id} label={label} render={(h, d) => render(item, h, d)} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function Row({
  id,
  label,
  render,
}: {
  id: string;
  label: string;
  render: (handle: ReactNode, dragging: boolean) => ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });
  const style: CSSProperties = {
    transform: transform ? `translate3d(0, ${Math.round(transform.y)}px, 0)` : undefined,
    transition,
    zIndex: isDragging ? 20 : undefined,
    position: "relative",
  };
  const handle = (
    <button
      type="button"
      ref={setActivatorNodeRef}
      {...attributes}
      {...listeners}
      aria-label={`Drag to reorder ${label}`}
      title="Drag to reorder (or press Space, then the arrow keys)"
      className="grid h-8 w-6 shrink-0 cursor-grab touch-none place-items-center rounded text-[var(--muted)] hover:text-[var(--ink)] active:cursor-grabbing"
    >
      {Icon.grip}
    </button>
  );
  return (
    <div ref={setNodeRef} style={style} className={isDragging ? "opacity-90 shadow-lg" : ""}>
      {render(handle, isDragging)}
    </div>
  );
}
