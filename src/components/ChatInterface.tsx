import { useState, useRef, useEffect, createContext, useContext } from "react";
import { Send, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatMessage } from "./ChatMessage";
import { TypingIndicator } from "./TypingIndicator";
import { QuickActions } from "./QuickActions";
import { AgentOrchestrator } from "./AgentOrchestrator";
import { SanctionLetter } from "./SanctionLetter";
import { useChatBot } from "@/hooks/useChatBot";
import { Customer } from "@/data/customers";
import { LoanApplication, AgentType, ConversationStage } from "@/types/chat";

interface ChatContextType {
  customer: Customer | null;
  loanApplication: LoanApplication | null;
  currentAgent: AgentType;
  stage: ConversationStage;
}

export const ChatContext = createContext<ChatContextType>({
  customer: null,
  loanApplication: null,
  currentAgent: 'master',
  stage: 'greeting'
});

export const useChatContext = () => useContext(ChatContext);

export const ChatInterface = () => {
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    messages,
    currentAgent,
    visitedAgents,
    stage,
    isTyping,
    customer,
    loanApplication,
    processUserInput,
    startConversation
  } = useChatBot();

  useEffect(() => {
    if (messages.length === 0) {
      startConversation();
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isTyping) {
      processUserInput(inputValue.trim());
      setInputValue("");
    }
  };

  const handleQuickAction = (action: string) => {
    if (!isTyping) {
      processUserInput(action);
    }
  };

  return (
    <ChatContext.Provider value={{ customer, loanApplication, currentAgent, stage }}>
      <div className="flex flex-col h-full">
        {/* Agent Orchestrator */}
        <div className="p-4 border-b border-border">
          <AgentOrchestrator currentAgent={currentAgent} visitedAgents={visitedAgents} />
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          
          {isTyping && <TypingIndicator agent={currentAgent} />}
          
          {/* Sanction Letter */}
          {stage === 'sanction_letter' && customer && loanApplication && (
            <div className="mt-4">
              <SanctionLetter customer={customer} loan={loanApplication} />
            </div>
          )}
          
          {/* Quick Actions */}
          {!isTyping && stage !== 'sanction_letter' && stage !== 'rejected' && stage !== 'completed' && (
            <QuickActions stage={stage} onAction={handleQuickAction} />
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-border bg-card">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={isTyping ? "Agent is typing..." : "Type your message..."}
                disabled={isTyping || stage === 'sanction_letter' || stage === 'completed'}
                className="pr-10 rounded-full bg-background border-border focus-visible:ring-primary"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground"
                disabled={isTyping}
              >
                <Paperclip className="h-4 w-4" />
              </Button>
            </div>
            <Button 
              type="submit" 
              size="icon" 
              className="rounded-full bg-gradient-primary hover:opacity-90 transition-opacity"
              disabled={!inputValue.trim() || isTyping}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </ChatContext.Provider>
  );
};
