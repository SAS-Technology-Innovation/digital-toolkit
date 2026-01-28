"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { getFieldConfig, isFieldEditable } from "@/lib/field-config";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Loader2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface EditableCellProps {
  value: unknown;
  field: string;
  rowId: string;
  canEdit: boolean;
  onSave: (rowId: string, field: string, value: unknown) => Promise<void>;
}

export function EditableCell({
  value,
  field,
  rowId,
  canEdit,
  onSave,
}: EditableCellProps) {
  const config = getFieldConfig(field);
  const editable = canEdit && isFieldEditable(field);

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  // Reset edit value when external value changes
  useEffect(() => {
    if (!editing) setEditValue(value);
  }, [value, editing]);

  // Auto-focus when entering edit mode
  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      if (inputRef.current instanceof HTMLInputElement) {
        inputRef.current.select();
      }
    }
  }, [editing]);

  const handleSave = useCallback(
    async (newValue: unknown) => {
      // No change
      if (newValue === value) {
        setEditing(false);
        return;
      }

      setSaving(true);
      try {
        await onSave(rowId, field, newValue);
        setEditValue(newValue);
        toast.success(`Updated ${config.label}`);
      } catch (err) {
        setEditValue(value); // revert
        toast.error(
          `Failed to update ${config.label}: ${err instanceof Error ? err.message : "Unknown error"}`
        );
      } finally {
        setSaving(false);
        setEditing(false);
      }
    },
    [value, rowId, field, config.label, onSave]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSave(editValue);
      } else if (e.key === "Escape") {
        setEditValue(value);
        setEditing(false);
      }
    },
    [editValue, value, handleSave]
  );

  // --- Display formatting ---
  const formatDisplay = (): string => {
    if (config.format) return config.format(editValue);
    if (editValue == null || editValue === "") return "";
    if (Array.isArray(editValue)) return editValue.join(", ");
    return String(editValue);
  };

  // --- Loading state ---
  if (saving) {
    return (
      <div className="flex items-center gap-1 text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" />
        <span className="text-xs">Saving...</span>
      </div>
    );
  }

  // --- Boolean toggle (always inline, no edit mode) ---
  if (config.type === "boolean") {
    return (
      <Switch
        checked={!!editValue}
        disabled={!editable}
        onCheckedChange={async (checked) => {
          if (!editable) return;
          setEditValue(checked);
          setSaving(true);
          try {
            await onSave(rowId, field, checked);
            toast.success(`Updated ${config.label}`);
          } catch (err) {
            setEditValue(value);
            toast.error(
              `Failed to update ${config.label}: ${err instanceof Error ? err.message : "Unknown error"}`
            );
          } finally {
            setSaving(false);
          }
        }}
      />
    );
  }

  // --- Readonly ---
  if (config.type === "readonly" || !editable) {
    return (
      <span className="text-sm truncate block max-w-full" title={formatDisplay()}>
        {formatDisplay() || <span className="text-muted-foreground">—</span>}
      </span>
    );
  }

  // --- Display mode (clickable) ---
  if (!editing) {
    const displayText = formatDisplay();
    return (
      <div
        className={cn(
          "min-h-[28px] flex items-center rounded px-1 -mx-1 cursor-pointer transition-colors",
          "hover:bg-muted/60"
        )}
        onClick={() => setEditing(true)}
        title={`Click to edit ${config.label}`}
      >
        <span className="text-sm truncate">
          {displayText || <span className="text-muted-foreground italic">Empty</span>}
        </span>
        {config.type === "url" && displayText && (
          <a
            href={displayText}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-1 text-muted-foreground hover:text-foreground"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
    );
  }

  // --- Edit modes ---

  // Text / URL / Number / Date
  if (
    config.type === "text" ||
    config.type === "url" ||
    config.type === "number" ||
    config.type === "date"
  ) {
    const inputType =
      config.type === "number"
        ? "number"
        : config.type === "date"
          ? "date"
          : "text";

    return (
      <Input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        type={inputType}
        value={editValue != null ? String(editValue) : ""}
        onChange={(e) => {
          const val = e.target.value;
          if (config.type === "number") {
            setEditValue(val === "" ? null : Number(val));
          } else {
            setEditValue(val || null);
          }
        }}
        onBlur={() => handleSave(editValue)}
        onKeyDown={handleKeyDown}
        className="h-7 text-sm px-1"
        step={config.type === "number" ? "any" : undefined}
      />
    );
  }

  // Textarea (in popover)
  if (config.type === "textarea") {
    return (
      <Popover open={editing} onOpenChange={(open) => {
        if (!open) handleSave(editValue);
      }}>
        <PopoverTrigger asChild>
          <div className="min-h-[28px] flex items-center">
            <span className="text-sm truncate">
              {formatDisplay() || <span className="text-muted-foreground italic">Empty</span>}
            </span>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-2" align="start">
          <Textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={editValue != null ? String(editValue) : ""}
            onChange={(e) => setEditValue(e.target.value || null)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setEditValue(value);
                setEditing(false);
              }
            }}
            className="min-h-[100px] text-sm"
            placeholder={`Enter ${config.label.toLowerCase()}...`}
          />
          <div className="flex justify-end mt-2 gap-1">
            <button
              className="text-xs text-muted-foreground hover:text-foreground px-2 py-1"
              onClick={() => {
                setEditValue(value);
                setEditing(false);
              }}
            >
              Cancel
            </button>
            <button
              className="text-xs bg-primary text-primary-foreground rounded px-2 py-1"
              onClick={() => handleSave(editValue)}
            >
              Save
            </button>
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  // Select dropdown
  if (config.type === "select") {
    return (
      <Select
        value={editValue != null ? String(editValue) : ""}
        onValueChange={(val) => {
          const newVal = val === "__clear__" ? null : val;
          setEditValue(newVal);
          handleSave(newVal);
        }}
        open={editing}
        onOpenChange={(open) => {
          if (!open) setEditing(false);
        }}
      >
        <SelectTrigger className="h-7 text-sm px-1 w-full">
          <SelectValue placeholder={`Select ${config.label.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__clear__">
            <span className="text-muted-foreground italic">Clear</span>
          </SelectItem>
          {(config.options ?? []).map((opt) => (
            <SelectItem key={opt} value={opt}>
              {opt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  // MultiSelect (in popover with checkboxes)
  if (config.type === "multiSelect") {
    const currentValues: string[] = Array.isArray(editValue)
      ? editValue
      : typeof editValue === "string"
        ? editValue.split(",").map((s) => s.trim()).filter(Boolean)
        : [];

    return (
      <Popover open={editing} onOpenChange={(open) => {
        if (!open) handleSave(currentValues.length > 0 ? currentValues : null);
      }}>
        <PopoverTrigger asChild>
          <div className="min-h-[28px] flex items-center">
            <span className="text-sm truncate">
              {currentValues.join(", ") || (
                <span className="text-muted-foreground italic">Empty</span>
              )}
            </span>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-2" align="start">
          <div className="space-y-2">
            {(config.options ?? []).map((opt) => (
              <label
                key={opt}
                className="flex items-center gap-2 text-sm cursor-pointer"
              >
                <Checkbox
                  checked={currentValues.includes(opt)}
                  onCheckedChange={(checked) => {
                    const newValues = checked
                      ? [...currentValues, opt]
                      : currentValues.filter((v) => v !== opt);
                    setEditValue(newValues);
                  }}
                />
                {opt}
              </label>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  // Fallback: text input
  return (
    <Input
      ref={inputRef as React.RefObject<HTMLInputElement>}
      type="text"
      value={editValue != null ? String(editValue) : ""}
      onChange={(e) => setEditValue(e.target.value || null)}
      onBlur={() => handleSave(editValue)}
      onKeyDown={handleKeyDown}
      className="h-7 text-sm px-1"
    />
  );
}
