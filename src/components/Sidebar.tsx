'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, MessageSquare, Gamepad2, Disc, Palette, Calendar,
  User, Trophy, BarChart3, Mail, Music, Bell, Bot, Send
} from 'lucide-react';

interface NavItem {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    items: [
      { href: '/', icon: Home, label: '首页' },
    ],
  },
  {
    title: '社区',
    items: [
      { href: '/community', icon: MessageSquare, label: '社区广场' },
      { href: '/community-rhythm', icon: Gamepad2, label: '音游区' },
      { href: '/community-charts', icon: Disc, label: '谱面讨论' },
      { href: '/community-art', icon: Palette, label: '联动创作' },
      { href: '/community-events', icon: Calendar, label: '活动比赛' },
    ],
  },
  {
    title: '个人',
    items: [
      { href: '/profile', icon: User, label: '个人主页' },
      { href: '/profile-scores', icon: Trophy, label: '成绩管理' },
      { href: '/leaderboard', icon: BarChart3, label: '排行榜' },
      { href: '/chat', icon: Mail, label: '私信' },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 bg-card overflow-y-auto border-r border-border">
      <nav className="p-4 space-y-1">
        {navSections.map((section, sectionIndex) => (
          <React.Fragment key={sectionIndex}>
            {section.title && (
              <div className="pt-4 pb-2 px-3">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {section.title}
                </span>
              </div>
            )}
            {section.items.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-secondary text-foreground'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </React.Fragment>
        ))}
      </nav>
    </aside>
  );
}
