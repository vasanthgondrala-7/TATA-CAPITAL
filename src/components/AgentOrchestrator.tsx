import { AgentType } from "@/types/chat";
import { AgentIndicator } from "./AgentIndicator";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface AgentOrchestratorProps {
  currentAgent: AgentType;
  visitedAgents: AgentType[];
}

const agentFlow: AgentType[] = ['master', 'sales', 'verification', 'underwriting', 'sanction'];

export const AgentOrchestrator = ({ currentAgent, visitedAgents }: AgentOrchestratorProps) => {
  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
        Agent Orchestration Flow
      </h3>
      <div className="flex items-center justify-between overflow-x-auto pb-2">
        {agentFlow.map((agent, index) => {
          const isVisited = visitedAgents.includes(agent);
          const isCurrent = currentAgent === agent;
          
          return (
            <div key={agent} className="flex items-center">
              <div className={cn(
                "transition-all duration-300",
                isVisited && !isCurrent && "opacity-50",
                !isVisited && !isCurrent && "opacity-30"
              )}>
                <AgentIndicator agent={agent} isActive={isCurrent} size="sm" />
              </div>
              {index < agentFlow.length - 1 && (
                <ChevronRight className={cn(
                  "h-4 w-4 mx-2 transition-colors",
                  visitedAgents.includes(agentFlow[index + 1]) || currentAgent === agentFlow[index + 1]
                    ? "text-primary"
                    : "text-muted-foreground/30"
                )} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
