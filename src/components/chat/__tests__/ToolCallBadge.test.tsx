import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolCallBadge, getToolCallLabel, getToolCallIcon } from "../ToolCallBadge";
import { FilePlus, FilePen, Eye, Trash2, FileSymlink } from "lucide-react";
import type { ToolInvocation } from "ai";

afterEach(() => {
  cleanup();
});

// --- getToolCallLabel ---

test("getToolCallLabel: str_replace_editor create with path", () => {
  expect(getToolCallLabel("str_replace_editor", { command: "create", path: "/src/App.jsx" })).toBe("Creating App.jsx");
});

test("getToolCallLabel: str_replace_editor create without path", () => {
  expect(getToolCallLabel("str_replace_editor", { command: "create" })).toBe("Creating file");
});

test("getToolCallLabel: str_replace_editor str_replace", () => {
  expect(getToolCallLabel("str_replace_editor", { command: "str_replace", path: "/src/Button.tsx" })).toBe("Editing Button.tsx");
});

test("getToolCallLabel: str_replace_editor insert", () => {
  expect(getToolCallLabel("str_replace_editor", { command: "insert", path: "/src/index.tsx" })).toBe("Editing index.tsx");
});

test("getToolCallLabel: str_replace_editor view", () => {
  expect(getToolCallLabel("str_replace_editor", { command: "view", path: "/src/App.jsx" })).toBe("Reading App.jsx");
});

test("getToolCallLabel: str_replace_editor undo_edit", () => {
  expect(getToolCallLabel("str_replace_editor", { command: "undo_edit", path: "/src/App.jsx" })).toBe("Undoing edit in App.jsx");
});

test("getToolCallLabel: str_replace_editor undo_edit without path", () => {
  expect(getToolCallLabel("str_replace_editor", { command: "undo_edit" })).toBe("Undoing edit");
});

test("getToolCallLabel: str_replace_editor unknown command falls back to Editing", () => {
  expect(getToolCallLabel("str_replace_editor", { command: "unknown", path: "/src/App.jsx" })).toBe("Editing App.jsx");
});

test("getToolCallLabel: str_replace_editor empty args falls back to Editing file", () => {
  expect(getToolCallLabel("str_replace_editor", {})).toBe("Editing file");
});

test("getToolCallLabel: file_manager rename with both paths", () => {
  expect(getToolCallLabel("file_manager", { command: "rename", path: "/src/Old.jsx", new_path: "/src/New.jsx" })).toBe("Renaming Old.jsx → New.jsx");
});

test("getToolCallLabel: file_manager rename without new_path", () => {
  expect(getToolCallLabel("file_manager", { command: "rename", path: "/src/Old.jsx" })).toBe("Renaming Old.jsx");
});

test("getToolCallLabel: file_manager rename without any path", () => {
  expect(getToolCallLabel("file_manager", { command: "rename" })).toBe("Renaming file");
});

test("getToolCallLabel: file_manager delete", () => {
  expect(getToolCallLabel("file_manager", { command: "delete", path: "/src/Unused.tsx" })).toBe("Deleting Unused.tsx");
});

test("getToolCallLabel: file_manager delete without path", () => {
  expect(getToolCallLabel("file_manager", { command: "delete" })).toBe("Deleting file");
});

test("getToolCallLabel: file_manager unknown command", () => {
  expect(getToolCallLabel("file_manager", { command: "unknown" })).toBe("Managing files");
});

test("getToolCallLabel: unknown tool falls back to tool name", () => {
  expect(getToolCallLabel("some_other_tool", {})).toBe("some_other_tool");
});

test("getToolCallLabel: uses only the basename of a nested path", () => {
  expect(getToolCallLabel("str_replace_editor", { command: "create", path: "/very/deep/nested/path/Component.tsx" })).toBe("Creating Component.tsx");
});

// --- getToolCallIcon ---

test("getToolCallIcon: create returns FilePlus", () => {
  expect(getToolCallIcon("str_replace_editor", { command: "create" })).toBe(FilePlus);
});

test("getToolCallIcon: view returns Eye", () => {
  expect(getToolCallIcon("str_replace_editor", { command: "view" })).toBe(Eye);
});

test("getToolCallIcon: str_replace returns FilePen", () => {
  expect(getToolCallIcon("str_replace_editor", { command: "str_replace" })).toBe(FilePen);
});

test("getToolCallIcon: file_manager delete returns Trash2", () => {
  expect(getToolCallIcon("file_manager", { command: "delete" })).toBe(Trash2);
});

test("getToolCallIcon: file_manager rename returns FileSymlink", () => {
  expect(getToolCallIcon("file_manager", { command: "rename" })).toBe(FileSymlink);
});

test("getToolCallIcon: unknown tool returns FilePen", () => {
  expect(getToolCallIcon("unknown_tool", {})).toBe(FilePen);
});

// --- ToolCallBadge rendering ---

function makeInvocation(overrides: Partial<ToolInvocation> = {}): ToolInvocation {
  return {
    toolCallId: "test-id",
    toolName: "str_replace_editor",
    args: { command: "create", path: "/src/App.jsx" },
    state: "result",
    result: "Success",
    ...overrides,
  } as ToolInvocation;
}

test("ToolCallBadge shows friendly label for create", () => {
  render(<ToolCallBadge toolInvocation={makeInvocation()} />);
  expect(screen.getByText("Creating App.jsx")).toBeDefined();
});

test("ToolCallBadge shows friendly label for str_replace", () => {
  render(<ToolCallBadge toolInvocation={makeInvocation({ args: { command: "str_replace", path: "/src/Button.tsx" } })} />);
  expect(screen.getByText("Editing Button.tsx")).toBeDefined();
});

test("ToolCallBadge shows friendly label for file_manager rename", () => {
  render(
    <ToolCallBadge
      toolInvocation={makeInvocation({
        toolName: "file_manager",
        args: { command: "rename", path: "/src/Old.jsx", new_path: "/src/New.jsx" },
      })}
    />
  );
  expect(screen.getByText("Renaming Old.jsx → New.jsx")).toBeDefined();
});

test("ToolCallBadge shows friendly label for file_manager delete", () => {
  render(
    <ToolCallBadge
      toolInvocation={makeInvocation({
        toolName: "file_manager",
        args: { command: "delete", path: "/src/Old.jsx" },
      })}
    />
  );
  expect(screen.getByText("Deleting Old.jsx")).toBeDefined();
});

test("ToolCallBadge shows spinner when not done", () => {
  const { container } = render(
    <ToolCallBadge toolInvocation={makeInvocation({ state: "call" })} />
  );
  expect(container.querySelector(".animate-spin")).toBeDefined();
  expect(container.querySelector(".bg-emerald-500")).toBeNull();
});

test("ToolCallBadge shows green dot when done", () => {
  const { container } = render(<ToolCallBadge toolInvocation={makeInvocation({ state: "result" })} />);
  expect(container.querySelector(".bg-emerald-500")).toBeDefined();
  expect(container.querySelector(".animate-spin")).toBeNull();
});

test("ToolCallBadge shows spinner for partial-call state", () => {
  const { container } = render(
    <ToolCallBadge toolInvocation={makeInvocation({ state: "partial-call" })} />
  );
  expect(container.querySelector(".animate-spin")).toBeDefined();
});

test("ToolCallBadge does not show raw tool name", () => {
  render(<ToolCallBadge toolInvocation={makeInvocation()} />);
  expect(screen.queryByText("str_replace_editor")).toBeNull();
});
