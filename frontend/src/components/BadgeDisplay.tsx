import React from 'react';
import { Trophy, Star, Award } from 'lucide-react';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface Props {
  badges: Badge[];
}

const BADGE_ICONS = {
  trophy: Trophy,
  star: Star,
  award: Award,
};

const RARITY_COLORS = {
  common: 'bg-gray-500',
  rare: 'bg-blue-500',
  epic: 'bg-purple-500',
  legendary: 'bg-yellow-500',
};

export function BadgeDisplay({ badges }: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {badges.map((badge) => {
        const IconComponent = BADGE_ICONS[badge.icon as keyof typeof BADGE_ICONS] || Award;

        return (
          <div
            key={badge.id}
            className={`rounded-lg border p-4 shadow-md ${RARITY_COLORS[badge.rarity]} bg-opacity-10 border-current`}
          >
            <div className="flex items-center gap-3">
              <div className={`rounded-full p-2 ${RARITY_COLORS[badge.rarity]} text-white`}>
                <IconComponent size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">{badge.name}</h3>
                <p className="text-sm text-gray-600">{badge.description}</p>
                <p className="text-xs text-gray-500">Earned: {badge.earnedAt}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}