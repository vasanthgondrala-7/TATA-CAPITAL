import { useState, useRef, useEffect } from "react";
import { Send, Paperclip, Bot, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatMessage } from "@/components/ChatMessage";
import { TypingIndicator } from "@/components/TypingIndicator";
import { QuickActions } from "@/components/QuickActions";
import { AgentOrchestrator } from "@/components/AgentOrchestrator";
import { SanctionLetter } from "@/components/SanctionLetter";
import { CustomerPanel } from "@/components/CustomerPanel";
import { useChatBot } from "@/hooks/useChatBot";

const Index = () => {
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-hero text-primary-foreground py-4 px-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary-foreground/10 flex items-center justify-center">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">TATA CAPITAL</h1>
              <p className="text-xs opacity-80">Personal Loan Assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-primary-foreground/10 px-3 py-1.5 rounded-full">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">AI Powered</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)]">
          {/* Chat Panel */}
          <div className="lg:col-span-2 bg-card rounded-2xl border border-border shadow-lg overflow-hidden flex flex-col">
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

          {/* Customer Info Panel */}
          <div className="hidden lg:block">
            <CustomerPanel customer={customer} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-card border-t border-border py-2 px-4 text-center text-xs text-muted-foreground">
        <p>Agentic AI Demo • Multi-Agent Loan Orchestration System</p>
      </footer>
    </div>
  );
};

export default Index;
