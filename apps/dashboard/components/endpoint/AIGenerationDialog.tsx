"use client";

import React, { useState } from "react";
import { Sparkles, Loader2, AlertCircle, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import AutoResizeTextarea from "@/components/auto-resize-textarea";
import { ModelSelector } from "@/components/model-selector";
import { AIService } from "@/services/ai.service";
import { toast } from "sonner";
import { useSetAtom } from "jotai";
import { aiGeneratedDataAtom } from "@/atoms/aiGenerationAtom";
import { Checkbox } from "@/components/ui/checkbox";


const EXAMPLE_PROMPTS = [
  "A blog API with posts, comments, and users. Posts can have multiple comments, and each comment belongs to a user.",
  "An e-commerce API with products, categories, orders, and customers. Include shopping cart functionality.",
  "A task management API with projects, tasks, and team members. Tasks should have priorities and due dates.",
  "A social media API with users, posts, likes, and followers. Include user authentication.",
];

const PLACEHOLDER_TEXT = "Example: A blog API with posts, comments, and users. Include authentication and CRUD operations for all resources...";

interface AIGenerationDialogProps {
  onClose: () => void;
}
export default function AIGenerationDialog({
  onClose,
}: AIGenerationDialogProps) {
  const [aiPrompt, setAiPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [showExamples, setShowExamples] = useState(false);
  const [isGenerateSchemas, setIsGenerateSchemas] = useState(true);
  const setAiGeneratedData = useSetAtom(aiGeneratedDataAtom);

  const handleAIPromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAiPrompt(e.target.value);
    setAiError(null);
  };

  const handleUseExample = (example: string) => {
    setAiPrompt(example);
    setShowExamples(false);
  };

  const handleGenerate = async () => {
    if (!aiPrompt.trim()) {
      toast.error("Please enter a description");
      return;
    }

    setIsGenerating(true);
    setAiError(null);

    try {
      const result = await AIService.generateEndpointsAndSchemasByAI(
        aiPrompt,
        selectedModel || undefined,
        isGenerateSchemas
      );

      if (!result || (!result.schemas?.length && !result.endpoints?.length)) {
        throw new Error(
          "No schemas or endpoints were generated. Please try with a more detailed description."
        );
      }

      toast.success(
        `Successfully generated ${result.schemas?.length || 0} schema(s) and ${
          result.endpoints?.length || 0
        } endpoint(s)`
      );
      
      setAiGeneratedData(result);
      onClose();
    } catch (error) {
      console.error("❌ [AI Generation Dialog] Error generating endpoints and schemas:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to generate. Please try again with a different description.";
      setAiError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* AI Model Selection */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-purple-600" />
          <label className="text-sm font-semibold">
            AI Model
          </label>
        </div>
        <ModelSelector
          value={selectedModel}
          onValueChange={setSelectedModel}
          placeholder="Use default model"
        />
        <p className="text-xs text-muted-foreground leading-relaxed">
          Choose an AI model or leave blank to use the default.
          Different models may produce varying results.
        </p>
      </div>

      {/* Generation Options */}
      <div className="space-y-3">
        <label className="text-sm font-semibold">
          Generation Options
        </label>
        <div className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
          <Checkbox
            id="isGenerateSchemas"
            checked={isGenerateSchemas}
            onCheckedChange={(checked) => setIsGenerateSchemas(checked === true)}
          />
          <div className="flex-1">
            <label htmlFor="isGenerateSchemas" className="text-sm font-medium cursor-pointer">
              Generate Schemas
            </label>
            <p className="text-xs text-muted-foreground mt-1">
              When enabled, AI will generate both schemas and endpoints. When disabled, only endpoints will be generated (useful if you already have schemas defined).
            </p>
          </div>
        </div>
      </div>

      {/* Project Description */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold">
            Description *
          </label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowExamples(!showExamples)}
            className="text-xs h-7"
          >
            <Lightbulb className="h-3 w-3 mr-1" />
            {showExamples ? "Hide" : "See"} Examples
          </Button>
        </div>

        {/* Example Prompts */}
        {showExamples && (
          <Card className="p-3 bg-muted/50 space-y-2">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Click an example to use it:
            </p>
            {EXAMPLE_PROMPTS.map((example, index) => (
              <Button
                key={index}
                type="button"
                onClick={() => handleUseExample(example)}
                className="text-xs"
                variant="outline"
              >
                {example}
              </Button>
            ))}
          </Card>
        )}

        <AutoResizeTextarea
          placeholder={PLACEHOLDER_TEXT}
          minRows={6}
          value={aiPrompt}
          onChange={handleAIPromptChange}
          className="font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground leading-relaxed">
          💡 <strong>Tip:</strong> Be specific about your entities,
          their relationships, and required operations for better results.
        </p>
      </div>

      {/* Error Display */}
      {aiError && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>Generation Failed</AlertTitle>
          <AlertDescription>{aiError}</AlertDescription>
        </Alert>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isGenerating}
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating || !aiPrompt.trim()}
          className="bg-gradient-to-r from-purple-500 to-blue-500 dark:from-purple-600 dark:to-blue-600 text-white hover:from-purple-600 hover:to-blue-600 dark:hover:from-purple-700 dark:hover:to-blue-700"
        >
          {isGenerating ? (
            <>
              <Loader2 className="size-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="size-4 mr-2" />
              Generate
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
