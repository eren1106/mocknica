"use client";

import React, { useState, useEffect } from "react";
import { Check, ChevronDown, Loader2, Cpu, Cloud, Server } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
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

const providerIcons = {
  gemini: Cloud,
  openai: Cloud,
  ollama: Server,
};

const providerColors = {
  gemini: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  openai: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  ollama: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
};

export function ModelSelector({ 
  value, 
  onValueChange, 
  placeholder = "Select AI model...",
  disabled = false 
}: ModelSelectorProps) {
  const [open, setOpen] = useState(false);
  const [models, setModels] = useState<AIModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch available models
  useEffect(() => {
    const fetchModels = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/ai/models');
        if (!response.ok) {
          throw new Error(`Failed to fetch models: ${response.statusText}`);
        }
        
        const responseData = await response.json();
        setModels(responseData.data?.models || []);
      } catch (err) {
        console.error('Error fetching AI models:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch models');
        
        // Fallback to hardcoded models if API fails
        // setModels([
        //   {
        //     id: 'gemini-2.0-flash',
        //     name: 'Gemini 2.0 Flash',
        //     provider: 'gemini',
        //     description: 'Fast and efficient Gemini model',
        //     isLocal: false
        //   },
        //   {
        //     id: 'gpt-4o-mini',
        //     name: 'GPT-4o Mini',
        //     provider: 'openai',
        //     description: 'Affordable and intelligent small model',
        //     isLocal: false
        //   }
        // ]);
      } finally {
        setLoading(false);
      }
    };

    fetchModels();
  }, []);

  const selectedModel = models.find(model => model.id === value);

  const groupedModels = models.reduce((acc, model) => {
    if (!acc[model.provider]) {
      acc[model.provider] = [];
    }
    acc[model.provider].push(model);
    return acc;
  }, {} as Record<string, AIModel[]>);

  const formatProviderName = (provider: string) => {
    switch (provider) {
      case 'gemini':
        return 'Google Gemini';
      case 'openai':
        return 'OpenAI';
      case 'ollama':
        return 'Ollama (Local)';
      default:
        return provider.charAt(0).toUpperCase() + provider.slice(1);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled || loading}
        >
          <div className="flex items-center gap-2 min-w-0">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading models...</span>
              </>
            ) : selectedModel ? (
              <>
                {React.createElement(providerIcons[selectedModel.provider], {
                  className: "h-4 w-4 flex-shrink-0"
                })}
                <span className="truncate">{selectedModel.name}</span>
                <Badge 
                  variant="secondary" 
                  className={cn("ml-auto flex-shrink-0", providerColors[selectedModel.provider])}
                >
                  {selectedModel.provider}
                </Badge>
              </>
            ) : (
              <>
                <Cpu className="h-4 w-4" />
                <span className="text-muted-foreground">{placeholder}</span>
              </>
            )}
          </div>
          <ChevronDown className="ml-2 h-4 w-4 flex-shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="Search models..." />
          <CommandList>
            {loading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm text-muted-foreground">Loading models...</span>
              </div>
            ) : error ? (
              <div className="p-4 text-center">
                <p className="text-sm text-destructive mb-2">Failed to load models</p>
                <p className="text-xs text-muted-foreground">{error}</p>
              </div>
            ) : Object.keys(groupedModels).length === 0 ? (
              <CommandEmpty>No models available.</CommandEmpty>
            ) : (
              Object.entries(groupedModels).map(([provider, providerModels]) => (
                <CommandGroup 
                  key={provider} 
                  heading={
                    <div className="flex items-center gap-2">
                      {React.createElement(providerIcons[provider as keyof typeof providerIcons], {
                        className: "h-4 w-4"
                      })}
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
                            "h-4 w-4 flex-shrink-0",
                            value === model.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium truncate">{model.name}</span>
                            {model.isLocal && (
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
                            )}
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
                        <Badge 
                          variant="secondary" 
                          className={cn("text-xs", providerColors[model.provider])}
                        >
                          {model.provider}
                        </Badge>
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