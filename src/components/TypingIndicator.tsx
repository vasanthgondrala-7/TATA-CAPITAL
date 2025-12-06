import { AgentType } from "@/types/chat";
import { AgentIndicator } from "./AgentIndicator";

interface TypingIndicatorProps {
  agent: AgentType;
}

export const TypingIndicator = ({ agent }: TypingIndicatorProps) => {
  return (
    <div className="flex gap-3 items-start animate-fade-in-up">
      <AgentIndicator agent={agent} size="sm" isActive />
      <div className="bg-card border border-border rounded-2xl rounded-tl-md px-4 py-3 shadow-sm">
        <div className="flex gap-1.5">
          <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-typing" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-typing" style={{ animationDelay: '200ms' }} />
          <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-typing" style={{ animationDelay: '400ms' }} />
        </div>
      </div>
    </div>
  );
};
