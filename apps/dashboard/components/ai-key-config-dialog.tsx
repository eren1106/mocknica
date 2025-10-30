"use client";

import React, { useState } from "react";
import { Key, AlertCircle, Info, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AIProviderType } from "@/lib/ai/types";
import { storeApiKey, hasApiKey } from "@/lib/ai/session-storage";
import NextImage from "@/components/next-image";
import { cn } from "@/lib/utils";

interface ApiKeyConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onKeysConfigured?: () => void;
  defaultProvider?: AIProviderType;
}

interface ProviderInfo {
  name: string;
  icon: string;
  description: string;
  getKeyUrl: string;
  placeholder: string;
  envVarName: string;
  isLocal?: boolean;
}

const providerInfo: Record<AIProviderType, ProviderInfo> = {
  [AIProviderType.GEMINI]: {
    name: "Google Gemini",
    icon: "/images/ai/gemini-color.svg",
    description: "Google's most capable AI model family",
    getKeyUrl: "https://aistudio.google.com/app/apikey",
    placeholder: "Enter your Gemini API key",
    envVarName: "GEMINI_API_KEY",
  },
  [AIProviderType.OPENAI]: {
    name: "OpenAI",
    icon: "/images/ai/openai.svg",
    description: "Industry-leading GPT models from OpenAI",
    getKeyUrl: "https://platform.openai.com/api-keys",
    placeholder: "Enter your OpenAI API key",
    envVarName: "OPENAI_API_KEY",
  },
  [AIProviderType.OLLAMA]: {
    name: "Ollama",
    icon: "/images/ai/ollama.svg",
    description: "Run AI models locally on your machine",
    getKeyUrl: "https://ollama.ai/download",
    placeholder: "No API key required (runs locally)",
    envVarName: "Not required",
    isLocal: true,
  },
};

export function ApiKeyConfigDialog({
  open,
  onOpenChange,
  onKeysConfigured,
  defaultProvider = AIProviderType.GEMINI,
}: ApiKeyConfigDialogProps) {
  const providers = Object.entries(providerInfo).filter(([provider, info]) => !info.isLocal); // temporary hide Ollama

  const [activeProvider, setActiveProvider] = useState<AIProviderType>(defaultProvider);
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({
    [AIProviderType.GEMINI]: "",
    [AIProviderType.OPENAI]: "",
  });
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [savedProviders, setSavedProviders] = useState<Set<AIProviderType>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSaveKey = async (provider: AIProviderType) => {
    const key = apiKeys[provider]?.trim();
    if (!key) return;

    setIsSubmitting(true);
    try {
      // Store in session storage
      storeApiKey(provider, key);
      
      // Mark as saved
      setSavedProviders(prev => new Set(prev).add(provider));
      
      // Clear the input
      setApiKeys(prev => ({ ...prev, [provider]: "" }));
      
      // Notify parent component
      setTimeout(() => {
        if (onKeysConfigured) {
          onKeysConfigured();
        }
      }, 500);
    } catch (error) {
      console.error(`Failed to save API key for ${provider}:`, error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Reset state when closing
    setApiKeys({
      [AIProviderType.GEMINI]: "",
      [AIProviderType.OPENAI]: "",
    });
    setShowKeys({});
    setSavedProviders(new Set());
    onOpenChange(false);
  };

  const toggleShowKey = (provider: string) => {
    setShowKeys(prev => ({ ...prev, [provider]: !prev[provider] }));
  };

  const isProviderConfigured = (provider: AIProviderType): boolean => {
    return savedProviders.has(provider) || hasApiKey(provider);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="size-5" />
            Configure AI Provider API Keys
          </DialogTitle>
          <DialogDescription>
            Choose a provider and enter your API key to enable AI features
          </DialogDescription>
        </DialogHeader>

        {/* Security Notice */}
        <Alert className="border-blue-500/50 bg-blue-50 dark:bg-blue-950/20">
          <Info className="size-4 text-blue-600 dark:text-blue-400" />
          <AlertTitle className="text-blue-900 dark:text-blue-100">Your keys are secure</AlertTitle>
          <AlertDescription className="text-blue-800 dark:text-blue-200">
            API keys are stored only in your browser's session storage and are never sent to our database.
            Keys will be cleared when you close your browser tab.
          </AlertDescription>
        </Alert>

        {/* Provider Tabs */}
        <Tabs value={activeProvider} onValueChange={(v) => setActiveProvider(v as AIProviderType)}>
          <TabsList className="grid w-full grid-cols-2">
            {providers.map(([provider, info]) => (
              <TabsTrigger
                key={provider}
                value={provider}
                className="flex items-center gap-2"
              >
                <NextImage
                  src={info.icon}
                  alt={info.name}
                  className={cn(
                    "size-4",
                    (provider === AIProviderType.OPENAI || provider === AIProviderType.OLLAMA) && "dark:invert"
                  )}
                />
                {info.name}
                {isProviderConfigured(provider as AIProviderType) && (
                  <CheckCircle2 className="size-3 text-green-600 dark:text-green-400" />
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {providers.map(([provider, info]) => (
            <TabsContent key={provider} value={provider} className="space-y-4 mt-4">
              <div className="space-y-3">
                {/* Provider Info */}
                <div className="flex items-start gap-3 p-4 rounded-lg border bg-muted/50">
                  <NextImage
                    src={info.icon}
                    alt={info.name}
                    className={cn(
                      "size-8 mt-1",
                      (provider === AIProviderType.OPENAI || provider === AIProviderType.OLLAMA) && "dark:invert"
                    )}
                  />
                  <div className="flex-1 space-y-1">
                    <h4 className="font-semibold">{info.name}</h4>
                    <p className="text-sm text-muted-foreground">{info.description}</p>
                    {!info.isLocal && (
                      <a
                        href={info.getKeyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                      >
                        Get your API key →
                      </a>
                    )}
                  </div>
                </div>

                {/* Ollama Special Instructions */}
                {info.isLocal ? (
                  <Alert>
                    <AlertCircle className="size-4" />
                    <AlertTitle>Local Installation Required</AlertTitle>
                    <AlertDescription className="space-y-2">
                      <p>Ollama runs AI models locally on your machine. No API key needed!</p>
                      <ol className="list-decimal list-inside space-y-1 text-sm">
                        <li>Download and install Ollama from <a href={info.getKeyUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">ollama.ai</a></li>
                        <li>Pull a model: <code className="bg-muted px-1 py-0.5 rounded">ollama pull llama3.2</code></li>
                        <li>Ensure Ollama is running on <code className="bg-muted px-1 py-0.5 rounded">http://localhost:11434</code></li>
                      </ol>
                    </AlertDescription>
                  </Alert>
                ) : (
                  <>
                    {/* API Key Input */}
                    <div className="space-y-2">
                      <Label htmlFor={`${provider}-key`}>
                        API Key
                        {isProviderConfigured(provider as AIProviderType) && (
                          <span className="ml-2 text-xs text-green-600 dark:text-green-400">
                            ✓ Configured
                          </span>
                        )}
                      </Label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Input
                            id={`${provider}-key`}
                            type={showKeys[provider] ? "text" : "password"}
                            placeholder={info.placeholder}
                            value={apiKeys[provider] || ""}
                            onChange={(e) =>
                              setApiKeys((prev) => ({
                                ...prev,
                                [provider]: e.target.value,
                              }))
                            }
                            className="pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => toggleShowKey(provider)}
                          >
                            {showKeys[provider] ? (
                              <EyeOff className="size-4" />
                            ) : (
                              <Eye className="size-4" />
                            )}
                          </Button>
                        </div>
                        <Button
                          onClick={() => handleSaveKey(provider as AIProviderType)}
                          disabled={!apiKeys[provider]?.trim() || isSubmitting}
                        >
                          {savedProviders.has(provider as AIProviderType) ? "Update" : "Save"}
                        </Button>
                      </div>
                      {/* <p className="text-xs text-muted-foreground">
                        Environment variable: <code className="bg-muted px-1 py-0.5 rounded">{info.envVarName}</code>
                      </p> */}
                    </div>

                    {/* Success Message */}
                    {isProviderConfigured(provider as AIProviderType) && (
                      <Alert className="border-green-500/50 bg-green-50 dark:bg-green-950/20">
                        <CheckCircle2 className="size-4 text-green-600 dark:text-green-400" />
                        <AlertTitle className="text-green-900 dark:text-green-100">
                          API key configured successfully
                        </AlertTitle>
                        <AlertDescription className="text-green-800 dark:text-green-200">
                          You can now use {info.name} models in your project. The key is stored
                          securely in your browser session.
                        </AlertDescription>
                      </Alert>
                    )}
                  </>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
