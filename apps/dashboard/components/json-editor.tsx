import React, { useRef } from "react";
import { cn } from "@/lib/utils";
import AutoResizeTextarea from "./auto-resize-textarea";

interface JsonEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minRows?: number;
  className?: string;
  disabled?: boolean;
}

const JsonEditor: React.FC<JsonEditorProps> = ({
  value,
  onChange,
  placeholder,
  minRows = 5,
  className,
  disabled = false,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Handle matching brackets
  const getMatchingBracket = (char: string): string | null => {
    const pairs: { [key: string]: string } = {
      "{": "}",
      "[": "]",
      "(": ")",
      "}": "{",
      "]": "[",
      ")": "(",
    };
    return pairs[char] || null;
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = event.currentTarget;
    const { selectionStart, selectionEnd, value } = textarea;


    // Auto-close brackets and quotes
    if (event.key === "{" || event.key === "[" || event.key === "(") {
      event.preventDefault();
      const matchingChar = getMatchingBracket(event.key);
      if (matchingChar) {
        const newValue =
          value.substring(0, selectionStart) +
          event.key +
          value.substring(selectionStart, selectionEnd) +
          matchingChar +
          value.substring(selectionEnd);

        textarea.value = newValue;
        const newPos = selectionStart + 1;
        textarea.setSelectionRange(newPos, newPos);
        onChange(newValue);
      }
      return;
    }

    // Auto-close quotes
    if (event.key === '"' || event.key === "'") {
      // Don't auto-close if we're inside a string or right after a character
      const prevChar = selectionStart > 0 ? value[selectionStart - 1] : null;
      const nextChar =
        selectionStart < value.length ? value[selectionStart] : null;

      // Skip if we're closing an existing quote
      if (nextChar === event.key) {
        event.preventDefault();
        textarea.setSelectionRange(selectionStart + 1, selectionStart + 1);
        return;
      }

      // Don't auto-close if we're typing between alphanumeric chars (likely part of a word)
      const isInsideWord =
        prevChar && /\w/.test(prevChar) && nextChar && /\w/.test(nextChar);

      if (!isInsideWord && !(prevChar === "\\")) {
        event.preventDefault();
        const newValue =
          value.substring(0, selectionStart) +
          event.key +
          value.substring(selectionStart, selectionEnd) +
          event.key +
          value.substring(selectionEnd);

        textarea.value = newValue;
        const newPos = selectionStart + 1;
        textarea.setSelectionRange(newPos, newPos);
        onChange(newValue);
      }
      return;
    }

    // Handle closing brackets (skip over if already present)
    if (event.key === "}" || event.key === "]" || event.key === ")") {
      if (value[selectionStart] === event.key) {
        event.preventDefault();
        textarea.setSelectionRange(selectionStart + 1, selectionStart + 1);
        return;
      }
    }

    // Handle Enter key for auto-indentation
    if (event.key === "Enter") {
      event.preventDefault();

      // Get current line to determine indentation
      const textBeforeCursor = value.substring(0, selectionStart);
      const currentLine = textBeforeCursor.split("\n").pop() || "";

      // Calculate base indentation from current line
      let indentation = currentLine.match(/^\s*/)?.[0] || "";

      // Check if we need to increase indentation (cursor after opening bracket)
      const lastNonWhitespaceChar = currentLine.trim().slice(-1);
      if (lastNonWhitespaceChar === "{" || lastNonWhitespaceChar === "[") {
        indentation += "  "; // Add two spaces for nested level
      }

      // Check if the next char is a closing bracket
      const nextChar = value.substring(selectionStart, selectionStart + 1);
      if ((nextChar === "}" || nextChar === "]") && indentation.length >= 2) {
        // For closing brackets, add two lines:
        // - One with normal indentation for the content
        // - One with reduced indentation for the closing bracket
        const reducedIndent = indentation.slice(0, -2);
        const newValue =
          value.substring(0, selectionStart) +
          "\n" +
          indentation +
          "\n" +
          reducedIndent +
          value.substring(selectionStart);

        textarea.value = newValue;
        const newPosition = selectionStart + 1 + indentation.length;
        textarea.setSelectionRange(newPosition, newPosition);
      } else {
        // Normal case - insert newline with same indentation
        const newValue =
          value.substring(0, selectionStart) +
          "\n" +
          indentation +
          value.substring(selectionEnd);

        textarea.value = newValue;
        const newPosition = selectionStart + 1 + indentation.length;
        textarea.setSelectionRange(newPosition, newPosition);
      }

      onChange(textarea.value);
      return;
    }

    // Handle Tab key for indentation
    if (event.key === "Tab") {
      event.preventDefault();

      // If there's a selection, indent or unindent multiple lines
      if (selectionStart !== selectionEnd) {
        const selectedText = value.substring(selectionStart, selectionEnd);
        const selectedLines = selectedText.split("\n");

        if (event.shiftKey) {
          // Unindent - remove spaces from start of each line
          const modifiedLines = selectedLines.map((line) => {
            return line.replace(/^( {1,2})/, ""); // Remove up to 2 spaces
          });

          const newText = modifiedLines.join("\n");
          const beforeSelection = value.substring(0, selectionStart);
          const afterSelection = value.substring(selectionEnd);

          const newValue = beforeSelection + newText + afterSelection;
          textarea.value = newValue;

          // Maintain selection
          textarea.setSelectionRange(
            selectionStart,
            selectionStart + newText.length
          );
          onChange(newValue);
        } else {
          // Indent - add 2 spaces to start of each line
          const modifiedLines = selectedLines.map((line) => {
            return "  " + line;
          });

          const newText = modifiedLines.join("\n");
          const beforeSelection = value.substring(0, selectionStart);
          const afterSelection = value.substring(selectionEnd);

          const newValue = beforeSelection + newText + afterSelection;
          textarea.value = newValue;

          // Maintain selection
          textarea.setSelectionRange(
            selectionStart,
            selectionStart + newText.length
          );
          onChange(newValue);
        }
      } else {
        // No selection, just insert 2 spaces at cursor
        const newValue =
          value.substring(0, selectionStart) +
          "  " + // Add two spaces for tab
          value.substring(selectionEnd);

        textarea.value = newValue;
        const newPosition = selectionStart + 2;
        textarea.setSelectionRange(newPosition, newPosition);

        onChange(newValue);
      }
      return;
    }

    // Handle Backspace to improve the editing experience
    if (event.key === "Backspace" && selectionStart === selectionEnd) {
      const charBeforeCursor = value[selectionStart - 1];
      const charAtCursor = value[selectionStart];

      // If we're between a pair of brackets or quotes, delete both
      if (
        (charBeforeCursor === "{" && charAtCursor === "}") ||
        (charBeforeCursor === "[" && charAtCursor === "]") ||
        (charBeforeCursor === "(" && charAtCursor === ")") ||
        (charBeforeCursor === '"' && charAtCursor === '"') ||
        (charBeforeCursor === "'" && charAtCursor === "'")
      ) {
        event.preventDefault();
        const newValue =
          value.substring(0, selectionStart - 1) +
          value.substring(selectionStart + 1);

        textarea.value = newValue;
        const newPosition = selectionStart - 1;
        textarea.setSelectionRange(newPosition, newPosition);

        onChange(newValue);
        return;
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <AutoResizeTextarea
      ref={textareaRef}
      className={cn(
        "flex w-full font-mono rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none",
        className
      )}
      minRows={minRows}
      placeholder={placeholder}
      value={value}
      onChange={handleChange}
      onKeyDown={(e) => {
        handleKeyDown(e);
      }}
      disabled={disabled}
      spellCheck={false}
    />
  );
};

export default JsonEditor;
