import React from 'react';
import {
  Utensils,
  ShoppingBag,
  Car,
  Zap,
  ShoppingCart,
  HeartPulse,
  Film,
  Home,
  GraduationCap,
  Sparkles,
  MoreHorizontal,
  Briefcase,
  Laptop,
  Building2,
  TrendingUp,
  Key,
  Gift,
  PieChart,
  Landmark,
  Coins,
  ShieldCheck,
  Binary,
  ArrowRightLeft,
  RotateCcw,
  Tag,
  Coffee,
  Plane,
  CreditCard,
  Flame,
  Dumbbell,
  Smartphone,
  Baby,
  Dog,
  DollarSign,
  Handshake,
  BookOpen,
  Wrench,
  Activity,
  Award,
  CircleDot,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Utensils,
  ShoppingBag,
  Car,
  Zap,
  ShoppingCart,
  HeartPulse,
  Film,
  Home,
  GraduationCap,
  Sparkles,
  MoreHorizontal,
  Briefcase,
  Laptop,
  Building2,
  TrendingUp,
  Key,
  Gift,
  PieChart,
  Landmark,
  Coins,
  ShieldCheck,
  Binary,
  ArrowRightLeft,
  RotateCcw,
  Tag,
  Coffee,
  Plane,
  CreditCard,
  Flame,
  Dumbbell,
  Smartphone,
  Baby,
  Dog,
  DollarSign,
  Handshake,
  BookOpen,
  Wrench,
  Activity,
  Award,
  CircleDot,
};

interface CategoryIconProps {
  icon?: string;
  color?: string;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  icon,
  color,
  className = '',
  size = 'sm',
}) => {
  const iconSizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const containerSizeClasses = {
    xs: 'w-5 h-5 text-[10px]',
    sm: 'w-7 h-7 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
  };

  const selectedIconSize = iconSizeClasses[size] || 'w-3.5 h-3.5';
  const selectedContainerSize = containerSizeClasses[size] || 'w-7 h-7 text-xs';

  // Check if icon string is a key in ICON_MAP
  if (icon && ICON_MAP[icon]) {
    const LucideComp = ICON_MAP[icon];
    return (
      <div
        className={`rounded-lg flex items-center justify-center shrink-0 transition-transform ${selectedContainerSize} ${className}`}
        style={{
          backgroundColor: color ? `${color}15` : '#f1f5f9',
          color: color || '#475569',
          border: `1px solid ${color ? `${color}30` : '#e2e8f0'}`,
        }}
      >
        <LucideComp className={selectedIconSize} />
      </div>
    );
  }

  // If icon is an emoji or single character string
  const isEmoji = icon && (icon.length <= 4 || /[\u{1F300}-\u{1F9FF}]/u.test(icon));
  if (isEmoji) {
    return (
      <div
        className={`rounded-lg flex items-center justify-center shrink-0 select-none ${selectedContainerSize} ${className}`}
        style={{
          backgroundColor: color ? `${color}15` : '#f1f5f9',
          border: `1px solid ${color ? `${color}30` : '#e2e8f0'}`,
        }}
      >
        <span className="leading-none">{icon}</span>
      </div>
    );
  }

  // Fallback default Tag icon
  return (
    <div
      className={`rounded-lg flex items-center justify-center shrink-0 ${selectedContainerSize} ${className}`}
      style={{
        backgroundColor: color ? `${color}15` : '#f1f5f9',
        color: color || '#475569',
        border: `1px solid ${color ? `${color}30` : '#e2e8f0'}`,
      }}
    >
      <Tag className={selectedIconSize} />
    </div>
  );
};
