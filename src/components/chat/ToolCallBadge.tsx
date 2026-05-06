import { Loader2, FilePlus, FilePen, Eye, Trash2, FileSymlink } from "lucide-react";
import type { ToolInvocation } from "ai";
import type { LucideIcon } from "lucide-react";

function getBaseName(path: string): string {
  return path.split("/").pop() || path;
}

export function getToolCallLabel(toolName: string, args: Record<string, unknown>): string {
  if (toolName === "str_replace_editor") {
    const file = args.path ? getBaseName(args.path as string) : null;
    switch (args.command) {
      case "create":    return file ? `Creating ${file}` : "Creating file";
      case "str_replace":
      case "insert":    return file ? `Editing ${file}` : "Editing file";
      case "view":      return file ? `Reading ${file}` : "Reading file";
      case "undo_edit": return file ? `Undoing edit in ${file}` : "Undoing edit";
      default:          return file ? `Editing ${file}` : "Editing file";
    }
  }

  if (toolName === "file_manager") {
    const from = args.path ? getBaseName(args.path as string) : null;
    switch (args.command) {
      case "rename": {
        const to = args.new_path ? getBaseName(args.new_path as string) : null;
        if (from && to) return `Renaming ${from} → ${to}`;
        return from ? `Renaming ${from}` : "Renaming file";
      }
      case "delete": return from ? `Deleting ${from}` : "Deleting file";
      default:       return "Managing files";
    }
  }

  return toolName;
}

export function getToolCallIcon(toolName: string, args: Record<string, unknown>): LucideIcon {
  if (toolName === "str_replace_editor") {
    switch (args.command) {
      case "create": return FilePlus;
      case "view":   return Eye;
      default:       return FilePen;
    }
  }
  if (toolName === "file_manager") {
    switch (args.command) {
      case "delete": return Trash2;
      default:       return FileSymlink;
    }
  }
  return FilePen;
}

interface ToolCallBadgeProps {
  toolInvocation: ToolInvocation;
}

export function ToolCallBadge({ toolInvocation }: ToolCallBadgeProps) {
  const { toolName, state } = toolInvocation;
  const args = (toolInvocation.args ?? {}) as Record<string, unknown>;
  const isDone = state === "result";
  const label = getToolCallLabel(toolName, args);
  const Icon = getToolCallIcon(toolName, args);

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {isDone ? (
        <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" aria-hidden="true" />
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600 flex-shrink-0" aria-hidden="true" />
      )}
      <Icon className="w-3 h-3 text-neutral-500 flex-shrink-0" aria-hidden="true" />
      <span className="text-neutral-700">{label}</span>
    </div>
  );
}
