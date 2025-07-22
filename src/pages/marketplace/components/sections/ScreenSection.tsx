import React from 'react';
import { Screen } from '../../types/marketplace.types';
import { ScreenCard } from '../screens/ScreenCard';

interface ScreenSectionProps {
  title: string;
  subtitle: string;
  icon: string;
  screens: Screen[];
  maxScreens?: number;
  onScreenSelect: (screen: Screen) => void;
  onFavoriteChange: () => void;
  className?: string;
  'data-testid'?: string;
}

export const ScreenSection = React.memo<ScreenSectionProps>(({
  title,
  subtitle,
  icon,
  screens,
  maxScreens,
  onScreenSelect,
  onFavoriteChange,
  className = "mb-8",
  'data-testid': testId
}) => {
  if (screens.length === 0) return null;

  const displayScreens = maxScreens ? screens.slice(0, maxScreens) : screens;

  return (
    <section className={className} data-testid={testId}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span className="text-2xl" aria-hidden="true">{icon}</span>
            {title}
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            {subtitle}
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-5 xl:grid-cols-5">
        {displayScreens.map((screen, index) => (
          <ScreenCard
            key={screen.id}
            screen={screen}
            index={index}
            onSelect={onScreenSelect}
            onFavoriteChange={onFavoriteChange}
            loading={false}
          />
        ))}
      </div>
    </section>
  );
});

ScreenSection.displayName = 'ScreenSection';