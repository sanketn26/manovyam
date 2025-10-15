import { useState, useCallback, useEffect } from "react";
import { useAtom, useAtomValue } from "jotai";
import { AIMessage, AIModel } from "../models/AIMessage";
import { IAIService } from "../services/interfaces/IAIService";
import {
  aiMessagesAtom,
  selectedAIModelAtom,
  aiPanelOpenAtom,
  aiLoadingAtom,
  errorAtom,
} from "../store/atoms";

/**
 * ViewModel for AI Assistant
 * Manages the state and business logic for AI interactions using Jotai
 */
export function useAIViewModel(aiService: IAIService) {
  const [messages, setMessages] = useAtom(aiMessagesAtom);
  const [availableModels, setAvailableModels] = useState<AIModel[]>([]);
  const [selectedModel, setSelectedModel] = useAtom(selectedAIModelAtom);
  const [isOpen, setIsOpen] = useAtom(aiPanelOpenAtom);
  const [isLoading, setIsLoading] = useAtom(aiLoadingAtom);
  const [error, setError] = useAtom(errorAtom);

  /**
   * Load conversation history and available models
   */
  const loadData = useCallback(async () => {
    try {
      const [history, models] = await Promise.all([
        aiService.getConversationHistory(),
        aiService.getAvailableModels(),
      ]);

      setMessages(history);
      setAvailableModels(models);
    } catch (err) {
      console.error("Error loading AI data:", err);
      setError(err instanceof Error ? err.message : "Failed to load AI data");
    }
  }, [aiService]);

  /**
   * Send a message to the AI
   */
  const sendMessage = useCallback(
    async (content: string, context?: string[]) => {
      if (!content.trim()) return;

      try {
        setIsLoading(true);
        setError(null);

        // Add user message to history
        await aiService.addMessageToHistory({
          role: "user",
          content,
        });

        // Reload messages to include user message
        const updatedHistory = await aiService.getConversationHistory();
        setMessages(updatedHistory);

        // Get AI response
        const response = await aiService.sendMessage(
          content,
          selectedModel,
          context
        );

        // Update messages with AI response
        setMessages((prev) => [...prev, response]);
      } catch (err) {
        console.error("Error sending message:", err);
        setError(err instanceof Error ? err.message : "Failed to send message");
      } finally {
        setIsLoading(false);
      }
    },
    [aiService, selectedModel]
  );

  /**
   * Change the selected AI model
   */
  const changeModel = useCallback((modelId: string) => {
    setSelectedModel(modelId);
  }, []);

  /**
   * Toggle the AI panel
   */
  const togglePanel = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  /**
   * Open the AI panel
   */
  const openPanel = useCallback(() => {
    setIsOpen(true);
  }, []);

  /**
   * Close the AI panel
   */
  const closePanel = useCallback(() => {
    setIsOpen(false);
  }, []);

  /**
   * Clear conversation history
   */
  const clearHistory = useCallback(async () => {
    try {
      await aiService.clearConversationHistory();
      const newHistory = await aiService.getConversationHistory();
      setMessages(newHistory);
    } catch (err) {
      console.error("Error clearing history:", err);
      setError(
        err instanceof Error ? err.message : "Failed to clear history"
      );
    }
  }, [aiService]);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    // State
    messages,
    availableModels,
    selectedModel,
    isOpen,
    isLoading,
    error,

    // Actions
    sendMessage,
    changeModel,
    togglePanel,
    openPanel,
    closePanel,
    clearHistory,
    loadData,
  };
}
