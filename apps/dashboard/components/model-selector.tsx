"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Check, ChevronDown, Loader2, Cpu, Settings } from "lucide-react";
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
import { ApiKeyConfigDialog } from "@/components/ai-key-config-dialog";
import { useQueryClient } from "@tanstack/react-query";
import { AI_MODELS_QUERY_KEY } from "@/hooks/useAiModels";

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
  const { data, isLoading, error, refetch } = useAiModels();
  const [open, setOpen] = useState(false);
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const queryClient = useQueryClient();

  const models = data?.models;
  const defaultModel = data?.defaultModel;
  const configurationRequired = data?.providers.length === 0;

  // Auto-select default model if no value is provided and default model is available
  useEffect(() => {
    if (!value && defaultModel && models?.some(model => model.id === defaultModel)) {
      onValueChange(defaultModel);
    }
  }, [value, defaultModel, models, onValueChange]);

  const handleKeysConfigured = async () => {
    // Invalidate and refetch the models query
    await queryClient.invalidateQueries({ queryKey: [AI_MODELS_QUERY_KEY] });
    await refetch();
  };

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
    <>
      <ApiKeyConfigDialog 
        open={showConfigDialog} 
        onOpenChange={setShowConfigDialog}
        onKeysConfigured={handleKeysConfigured}
      />
      
      {/* set modal={true} to fix nested popover issue */}
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
            ) : configurationRequired || error || Object.keys(groupedModels).length === 0 ? (
              <div className="p-4 space-y-3">
                <div className="text-center space-y-2">
                  <p className="text-sm font-medium">No AI providers configured</p>
                  <p className="text-xs text-muted-foreground">
                    No AI provider API keys have been configured by the host. You can add your own for quick testing; they will only persist in this browser-tab session.
                  </p>
                </div>
                
                <Button 
                  onClick={() => {
                    setOpen(false);
                    setShowConfigDialog(true);
                  }}
                  className="w-full"
                  variant="default"
                >
                  <Settings className="size-4 mr-2" />
                  Configure Your Own API Keys
                </Button>
                
                {/* <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground mb-2">Available providers:</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li className="flex items-center gap-2">
                      <NextImage src="/images/ai/gemini-color.svg" alt="Gemini" className="size-4" />
                      Google Gemini
                    </li>
                    <li className="flex items-center gap-2">
                      <NextImage src="/images/ai/openai.svg" alt="OpenAI" className="size-4 dark:invert" />
                      OpenAI (GPT models)
                    </li>
                    <li className="flex items-center gap-2">
                      <NextImage src="/images/ai/ollama.svg" alt="Ollama" className="size-4 dark:invert" />
                      Ollama (Local models)
                    </li>
                  </ul>
                </div> */}
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
    </>
  );
}