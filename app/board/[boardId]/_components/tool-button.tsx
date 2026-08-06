/**
 * @file tool-button.tsx
 * @description Provides the ToolButton component, a reusable icon button used
 * in the canvas toolbar. Each button displays a tooltip hint on hover and
 * supports active and disabled visual states.
 */

"use client";

import { LucideIcon } from "lucide-react";

import { Hint } from "@/components/hint";
import { Button } from "@/components/ui/button";

import { TOOL_BUTTON_HINT_OFFSET } from "./constants";

/**
 * Props for the ToolButton component.
 *
 * @interface ToolButtonProps
 * @property {string} label - The accessible label and tooltip text displayed
 *   when hovering over the button.
 * @property {LucideIcon} icon - The Lucide icon component to render inside
 *   the button.
 * @property {() => void} onClick - Callback function invoked when the button
 *   is clicked.
 * @property {boolean} [isActive] - Whether the tool is currently active/selected.
 *   When `true`, the button renders with the `"boardActive"` variant for
 *   visual emphasis. Defaults to `false`.
 * @property {boolean} [isDisabled] - Whether the button is disabled and
 *   non-interactive. Defaults to `false`.
 */
interface ToolButtonProps {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  isActive?: boolean;
  isDisabled?: boolean;
}

/**
 * ToolButton component renders an icon button intended for use in the canvas
 * toolbar. It wraps the button in a {@link Hint} tooltip that appears to the
 * right of the button.
 *
 * - When `isActive` is `true`, the button uses the `"boardActive"` variant.
 * - When `isDisabled` is `true`, the button is non-interactive and visually
 *   indicated as disabled.
 *
 * This is a **Client Component** (`"use client"`) as it relies on interactive
 * UI behavior.
 *
 * @param {ToolButtonProps} props - The props for the ToolButton component.
 * @returns {JSX.Element} A tooltip-wrapped icon button.
 *
 * @example
 * // Render an active pencil tool button
 * <ToolButton
 *   icon={PencilIcon}
 *   label="Pen"
 *   isActive={true}
 *   onClick={() => setCanvasState({ mode: CanvasMode.Pencil })}
 * />
 *
 * @example
 * // Render a disabled undo button
 * <ToolButton
 *   icon={Undo2Icon}
 *   label="Undo"
 *   isDisabled={!canUndo}
 *   onClick={undo}
 * />
 */
export function ToolButton({
  label,
  icon: Icon,
  onClick,
  isActive,
  isDisabled,
}: ToolButtonProps) {
  return (
    // Hint provides an accessible tooltip displayed to the right of the button
    <Hint label={label} side="right" sideOffset={TOOL_BUTTON_HINT_OFFSET}>
      <Button
        aria-label={label}
        disabled={isDisabled}
        size="icon"
        variant={isActive ? "boardActive" : "board"}
        onClick={onClick}
      >
        <Icon />
      </Button>
    </Hint>
  );
}
