"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EditableCell } from "@/components/ui/editable-cell";
import {
  FIELD_CONFIGS,
  getFieldConfig,
  getDefaultColumns,
  getAllFieldKeys,
} from "@/lib/field-config";
import type { VisibilityState } from "@tanstack/react-table";

// Generic app row type — works with both Supabase raw rows and transformed data
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AppRow = Record<string, any> & { id: string };

/**
 * Create column definitions for app data tables.
 * Uses EditableCell for inline editing when the DataTable provides onCellEdit + canEdit via meta.
 *
 * @param fields - Optional list of field keys to include. Defaults to all fields.
 * @param options - Additional options for column customization.
 */
export function createAppColumns(
  fields?: string[],
  options?: {
    sortable?: boolean;
  }
): ColumnDef<AppRow, unknown>[] {
  const fieldKeys = fields ?? getAllFieldKeys();
  const sortable = options?.sortable ?? true;

  return fieldKeys
    .filter((key) => FIELD_CONFIGS[key]) // only known fields
    .map((key) => {
      const config = getFieldConfig(key);

      const column: ColumnDef<AppRow, unknown> = {
        accessorKey: key,
        header: sortable
          ? ({ column }) => (
              <Button
                variant="ghost"
                size="sm"
                className="-ml-3 h-8"
                onClick={() =>
                  column.toggleSorting(column.getIsSorted() === "asc")
                }
              >
                {config.label}
                <ArrowUpDown className="ml-1 h-3 w-3" />
              </Button>
            )
          : config.label,
        size: config.width ?? 150,
        cell: ({ row, table }) => {
          const cellValue = row.getValue(key);
          const meta = table.options.meta;
          const canEdit = meta?.canEdit ?? false;
          const onSave = meta?.onCellEdit;

          if (!onSave) {
            // No edit callback — render as plain display
            const display = config.format
              ? config.format(cellValue)
              : cellValue != null
                ? Array.isArray(cellValue)
                  ? cellValue.join(", ")
                  : String(cellValue)
                : "";
            return (
              <span className="text-sm truncate block" title={display}>
                {display || "—"}
              </span>
            );
          }

          return (
            <EditableCell
              value={cellValue}
              field={key}
              rowId={row.original.id}
              canEdit={canEdit}
              onSave={onSave}
            />
          );
        },
      };

      return column;
    });
}

/**
 * Returns a VisibilityState that shows only the default columns.
 * All other columns are hidden but can be toggled on.
 */
export function getDefaultColumnVisibility(): VisibilityState {
  const defaultCols = new Set(getDefaultColumns());
  const allKeys = getAllFieldKeys();
  const visibility: VisibilityState = {};

  for (const key of allKeys) {
    visibility[key] = defaultCols.has(key);
  }

  return visibility;
}
