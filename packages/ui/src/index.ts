// ============================================
// CORE UI COMPONENTS (shadcn/ui based)
// ============================================
export * from "./components/ui/accordion";
export * from "./components/ui/alert";
export * from "./components/ui/avatar";
export * from "./components/ui/badge";
export * from "./components/ui/button";
export * from "./components/ui/calendar";
export * from "./components/ui/card";
export * from "./components/ui/checkbox";
export * from "./components/ui/command";
export * from "./components/ui/dialog";
export * from "./components/ui/dropdown-menu";
export * from "./components/ui/form";
export * from "./components/ui/input";
export * from "./components/ui/label";
export * from "./components/ui/popover";
export {
  Popover as PopoverForDialog,
  PopoverTrigger as PopoverTriggerForDialog,
  PopoverContent as PopoverContentForDialog,
} from "./components/ui/popover-for-dialog";
export * from "./components/ui/radio-group";
export * from "./components/ui/scroll-area";
export * from "./components/ui/select";
export * from "./components/ui/separator";
export * from "./components/ui/sheet";
export * from "./components/ui/skeleton";
export * from "./components/ui/sonner";
export * from "./components/ui/switch";
export * from "./components/ui/tabs";
export * from "./components/ui/textarea";
export * from "./components/ui/toggle";
export * from "./components/ui/tooltip";

// ============================================
// SHARED CUSTOM COMPONENTS (Generic & Reusable)
// ============================================
// TODO: These need their app-specific dependencies removed/abstracted:
// - auto-resize-textarea (remove app-specific types)
// - combobox (remove @/types imports)
// - dynamic-select (remove @/types imports)
// - generic-form-field (remove @/lib, @/types imports)
// - json-editor (works but uses auto-resize-textarea)
// - json-viewer (should work)
// - rich-text-editor (needs @tiptap deps)
// - searchbar (should work)
// - next-image (should work)

export * from "./components/date-picker";
export * from "./components/mode-toggle";
export * from "./components/password-input";
export * from "./components/separator-with-text";
export * from "./components/spinner";
export * from "./components/link-button";
export * from "./components/next-image";

// export * from "./components/auto-resize-textarea"; // Has prop type issues
// export * from "./components/combobox"; // Uses @/types/select-option
// export * from "./components/dynamic-select"; // Uses @/types/select-option
// export * from "./components/json-editor"; // Uses auto-resize-textarea
// export * from "./components/json-viewer"; // Should work
// export * from "./components/rich-text-editor"; // Uses @tiptap
// export * from "./components/searchbar"; // Should work
// export * from "./components/next-image"; // Should work

// ============================================
// PROVIDERS
// ============================================
export * from "./components/providers/theme-provider";

// ============================================
// UTILS
// ============================================
export { cn } from "./lib/utils";

// ============================================
// NOTE: The following are NOT exported (app-specific):
// - layout/* (uses app routing/contexts/hooks)
// - controls-bar, cors-origins-input (domain-specific)
// - delete-confirmation, form-button (uses app schemas)
// - dialog-button, dynamic-dialog-trigger (uses app patterns)
// - generic-form-field (heavily app-coupled)
// - input-tags (might work with fixes)
// - link-button (might work)
// - my-tooltip (should work)
// - zod-form (app-specific patterns)
// ============================================
