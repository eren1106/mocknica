"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Check, ChevronDown, Loader2, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAiModels } from "@/hooks/useAiModels";
import NextImage from "@/components/next-image";

interface AIModel {
  id: string;
  name: string;
  provider: 'gemini' | 'openai' | 'ollama';
  description?: string;
  maxTokens?: number;
  isLocal?: boolean;
}

interface ModelSelectorProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

const providerIconPaths = {
  gemini: "/images/ai/gemini-color.svg",
  openai: "/images/ai/openai.svg",
  ollama: "/images/ai/ollama.svg",
};

// Model-specific icons (maps model name patterns to icon paths)
const getModelIcon = (modelId: string, provider: string): string | null => {
  const lowerModelId = modelId.toLowerCase();
  
  // Gemini models
  if (lowerModelId.includes('gemini')) {
    return "/images/ai/gemini-color.svg";
  }
  
  // OpenAI models (GPT)
  if (lowerModelId.includes('gpt')) {
    return "/images/ai/openai.svg";
  }
  
  // DeepSeek models
  if (lowerModelId.includes('deepseek')) {
    return "/images/ai/deepseek-color.svg";
  }
  
  // Mistral models
  if (lowerModelId.includes('mistral')) {
    return "/images/ai/mistral-color.svg";
  }
  
  // Llama models (use Ollama icon as fallback)
  if (lowerModelId.includes('llama')) {
    return "/images/ai/meta-color.svg";
  }
  
  // Default to provider icon
  return providerIconPaths[provider as keyof typeof providerIconPaths] || null;
};

const ProviderIcon = ({ provider, className }: { provider: keyof typeof providerIconPaths; className?: string }) => (
  <NextImage 
    src={providerIconPaths[provider]} 
    alt={`${provider} icon`}
    className={cn(
      className,
      (provider === 'openai' || provider === 'ollama') && "dark:invert"
    )}
  />
);

const ModelIcon = ({ modelId, provider, className }: { modelId: string; provider: string; className?: string }) => {
  const iconPath = getModelIcon(modelId, provider);
  if (!iconPath) return null;
  
  const needsInvert = iconPath.includes('openai') || iconPath.includes('ollama');
  
  return (
    <NextImage 
      src={iconPath} 
      alt={`${modelId} icon`}
      className={cn(
        className,
        needsInvert && "dark:invert"
      )}
    />
  );
};

// const providerColors = {
//   gemini: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
//   openai: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
//   ollama: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
// };

export function ModelSelector({ 
  value, 
  onValueChange, 
  placeholder = "Select AI model...",
  disabled = false 
}: ModelSelectorProps) {
  const { data, isLoading, error } = useAiModels();
  const [open, setOpen] = useState(false);

  const models = data?.models;
  const defaultModel = data?.defaultModel;

  // Auto-select default model if no value is provided and default model is available
  useEffect(() => {
    if (!value && defaultModel && models?.some(model => model.id === defaultModel)) {
      onValueChange(defaultModel);
    }
  }, [value, defaultModel, models, onValueChange]);

  const selectedModel = models?.find(model => model.id === value);

  const groupedModels = useMemo(() => {
    return models?.reduce((acc, model) => {
      if (!acc[model.provider]) {
        acc[model.provider] = [];
      }
      acc[model.provider].push(model);
      return acc;
    }, {} as Record<string, AIModel[]>) || {};
  }, [models]);

  const formatProviderName = (provider: string) => {
    switch (provider) {
      case 'gemini':
        return 'Google Gemini';
      case 'openai':
        return 'OpenAI';
      case 'ollama':
        return 'Ollama';
      default:
        return provider.charAt(0).toUpperCase() + provider.slice(1);
    }
  };

  return (
    // set modal={true} to fix nested popover issue
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled || isLoading}
        >
          <div className="flex items-center gap-2 min-w-0">
            {isLoading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Loading models...</span>
              </>
            ) : selectedModel ? (
              <>
                <ModelIcon 
                  modelId={selectedModel.id}
                  provider={selectedModel.provider} 
                  className="size-4 flex-shrink-0"
                />
                <span className="truncate">{selectedModel.name}</span>
                {/* <Badge 
                  variant="secondary" 
                  className={cn("ml-auto flex-shrink-0", providerColors[selectedModel.provider])}
                >
                  {selectedModel.provider}
                </Badge> */}
              </>
            ) : (
              <>
                <Cpu className="size-4" />
                <span className="text-muted-foreground">{models?.length ? placeholder : 'No models available, please configure at least one AI provider.'} </span>
              </>
            )}
          </div>
          <ChevronDown className="ml-2 size-4 flex-shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search models..." />
          <CommandList>
            {isLoading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="size-4 animate-spin mr-2" />
                <span className="text-sm text-muted-foreground">Loading models...</span>
              </div>
            ) : error ? (
              <div className="p-4 text-center space-y-2">
                <p className="text-sm text-destructive font-medium">AI services unavailable</p>
                <p className="text-xs text-muted-foreground">
                  Please configure at least one AI provider:
                </p>
                <ul className="text-xs text-muted-foreground text-left list-disc list-inside space-y-1">
                  <li>Set GEMINI_API_KEY environment variable</li>
                  <li>Set OPENAI_API_KEY environment variable</li>
                  <li>Run Ollama locally (http://localhost:11434)</li>
                </ul>
              </div>
            ) : Object.keys(groupedModels).length === 0 ? (
              <div className="p-4 text-center space-y-2">
                <p className="text-sm text-muted-foreground font-medium">No models available</p>
                <p className="text-xs text-muted-foreground">
                  All configured AI providers are currently unavailable. Please check:
                </p>
                <ul className="text-xs text-muted-foreground text-left list-disc list-inside space-y-1">
                  <li>API keys are valid</li>
                  <li>Network connectivity</li>
                  <li>Ollama is running (for local models)</li>
                </ul>
              </div>
            ) : (
              Object.entries(groupedModels).map(([provider, providerModels]) => (
                <CommandGroup 
                  key={provider} 
                  heading={
                    <div className="flex items-center gap-2">
                      <ProviderIcon 
                        provider={provider as keyof typeof providerIconPaths} 
                        className="size-4"
                      />
                      {formatProviderName(provider)}
                    </div>
                  }
                >
                  {providerModels.map((model) => (
                    <CommandItem
                      key={model.id}
                      value={model.id}
                      onSelect={(currentValue) => {
                        onValueChange(currentValue === value ? "" : currentValue);
                        setOpen(false);
                      }}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <Check
                          className={cn(
                            "size-4 flex-shrink-0",
                            value === model.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <ModelIcon 
                          modelId={model.id}
                          provider={model.provider}
                          className="size-4 flex-shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium truncate">{model.name}</span>
                            {/* {model.isLocal && (
                              <Tooltip>
                                <TooltipTrigger>
                                  <Badge variant="outline" className="text-xs">
                                    Local
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Runs locally on your machine</p>
                                </TooltipContent>
                              </Tooltip>
                            )} */}
                          </div>
                          {model.description && (
                            <p className="text-xs text-muted-foreground truncate">
                              {model.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {model.maxTokens && (
                          <Tooltip>
                            <TooltipTrigger>
                              <Badge variant="secondary" className="text-xs">
                                {model.maxTokens > 1000 
                                  ? `${Math.round(model.maxTokens / 1000)}K` 
                                  : model.maxTokens
                                }
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Max tokens: {model.maxTokens.toLocaleString()}</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                        {/* <Badge 
                          variant="secondary" 
                          className={cn("text-xs", providerColors[model.provider])}
                        >
                          {model.provider}
                        </Badge> */}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}