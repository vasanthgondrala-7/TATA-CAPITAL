import { Bot, Users, Shield, Calculator, FileText } from "lucide-react";
import { AgentType } from "@/types/chat";
import { cn } from "@/lib/utils";

interface AgentIndicatorProps {
  agent: AgentType;
  isActive?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const agentConfig: Record<AgentType, { 
  label: string; 
  icon: typeof Bot; 
  colorClass: string;
  bgClass: string;
}> = {
  master: {
    label: "Master Agent",
    icon: Bot,
    colorClass: "text-primary",
    bgClass: "bg-primary/10"
  },
  sales: {
    label: "Sales Agent",
    icon: Users,
    colorClass: "text-agent-sales",
    bgClass: "bg-purple-500/10"
  },
  verification: {
    label: "Verification Agent",
    icon: Shield,
    colorClass: "text-agent-verification",
    bgClass: "bg-amber-500/10"
  },
  underwriting: {
    label: "Underwriting Agent",
    icon: Calculator,
    colorClass: "text-agent-underwriting",
    bgClass: "bg-emerald-500/10"
  },
  sanction: {
    label: "Sanction Agent",
    icon: FileText,
    colorClass: "text-destructive",
    bgClass: "bg-destructive/10"
  }
};

export const AgentIndicator = ({ agent, isActive = false, size = 'md' }: AgentIndicatorProps) => {
  const config = agentConfig[agent];
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'h-6 w-6 text-xs',
    md: 'h-8 w-8 text-sm',
    lg: 'h-10 w-10 text-base'
  };

  const iconSizes = {
    sm: 12,
    md: 16,
    lg: 20
  };

  return (
    <div className="flex items-center gap-2">
      <div 
        className={cn(
          "rounded-full flex items-center justify-center transition-all duration-300",
          config.bgClass,
          sizeClasses[size],
          isActive && "ring-2 ring-offset-2 ring-offset-background animate-pulse-slow",
          isActive && agent === 'master' && "ring-primary",
          isActive && agent === 'sales' && "ring-purple-500",
          isActive && agent === 'verification' && "ring-amber-500",
          isActive && agent === 'underwriting' && "ring-emerald-500",
          isActive && agent === 'sanction' && "ring-destructive"
        )}
      >
        <Icon className={config.colorClass} size={iconSizes[size]} />
      </div>
      <span className={cn(
        "font-medium",
        config.colorClass,
        size === 'sm' && 'text-xs',
        size === 'md' && 'text-sm',
        size === 'lg' && 'text-base'
      )}>
        {config.label}
      </span>
    </div>
  );
};
