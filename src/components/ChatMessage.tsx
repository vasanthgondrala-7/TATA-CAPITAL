import { Message } from "@/types/chat";
import { AgentIndicator } from "./AgentIndicator";
import { cn } from "@/lib/utils";
import { User } from "lucide-react";

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const isAgent = message.sender === 'agent';

  return (
    <div 
      className={cn(
        "flex gap-3 animate-fade-in-up",
        isAgent ? "justify-start" : "justify-end"
      )}
    >
      {isAgent && message.agent && (
        <div className="flex-shrink-0 mt-1">
          <AgentIndicator agent={message.agent} size="sm" />
        </div>
      )}
      
      <div className={cn(
        "max-w-[75%] rounded-2xl px-4 py-3 shadow-sm",
        isAgent 
          ? "bg-card border border-border rounded-tl-md" 
          : "bg-gradient-primary text-primary-foreground rounded-tr-md"
      )}>
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        
        {message.metadata && (
          <div className={cn(
            "mt-3 pt-3 border-t text-xs space-y-1",
            isAgent ? "border-border" : "border-primary-foreground/20"
          )}>
            {message.metadata.loanAmount && (
              <div className="flex justify-between">
                <span className="opacity-70">Loan Amount:</span>
                <span className="font-semibold">₹{message.metadata.loanAmount.toLocaleString()}</span>
              </div>
            )}
            {message.metadata.tenure && (
              <div className="flex justify-between">
                <span className="opacity-70">Tenure:</span>
                <span className="font-semibold">{message.metadata.tenure} months</span>
              </div>
            )}
            {message.metadata.interestRate && (
              <div className="flex justify-between">
                <span className="opacity-70">Interest Rate:</span>
                <span className="font-semibold">{message.metadata.interestRate}% p.a.</span>
              </div>
            )}
            {message.metadata.emi && (
              <div className="flex justify-between">
                <span className="opacity-70">EMI:</span>
                <span className="font-semibold">₹{message.metadata.emi.toLocaleString()}/month</span>
              </div>
            )}
            {message.metadata.creditScore && (
              <div className="flex justify-between">
                <span className="opacity-70">Credit Score:</span>
                <span className={cn(
                  "font-semibold",
                  message.metadata.creditScore >= 750 && "text-success",
                  message.metadata.creditScore >= 650 && message.metadata.creditScore < 750 && "text-warning",
                  message.metadata.creditScore < 650 && "text-destructive"
                )}>
                  {message.metadata.creditScore}/900
                </span>
              </div>
            )}
          </div>
        )}
        
        <p className={cn(
          "text-[10px] mt-2 opacity-50",
          isAgent ? "text-left" : "text-right"
        )}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>

      {!isAgent && (
        <div className="flex-shrink-0 mt-1">
          <div className="h-6 w-6 rounded-full bg-secondary flex items-center justify-center">
            <User className="h-3 w-3 text-secondary-foreground" />
          </div>
        </div>
      )}
    </div>
  );
};
