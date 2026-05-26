export interface SubscriptionPreset {
  id: string;
  name: string;
  category: string;
  monthlyAmount: number;
  icon: string; // emoji
}

export const SUBSCRIPTION_PRESETS: SubscriptionPreset[] = [
  // Streaming
  { id: 'netflix', name: 'Netflix', category: 'Streaming', monthlyAmount: 17, icon: '🎬' },
  { id: 'hulu', name: 'Hulu', category: 'Streaming', monthlyAmount: 18, icon: '📺' },
  { id: 'disney-plus', name: 'Disney+', category: 'Streaming', monthlyAmount: 14, icon: '🏰' },
  { id: 'hbo-max', name: 'HBO Max', category: 'Streaming', monthlyAmount: 16, icon: '🎭' },
  { id: 'apple-tv-plus', name: 'Apple TV+', category: 'Streaming', monthlyAmount: 10, icon: '🍎' },
  { id: 'peacock', name: 'Peacock', category: 'Streaming', monthlyAmount: 8, icon: '🦚' },
  { id: 'paramount-plus', name: 'Paramount+', category: 'Streaming', monthlyAmount: 8, icon: '⭐' },
  // Music
  { id: 'spotify', name: 'Spotify', category: 'Music', monthlyAmount: 11, icon: '🎵' },
  { id: 'apple-music', name: 'Apple Music', category: 'Music', monthlyAmount: 11, icon: '🎶' },
  { id: 'tidal', name: 'Tidal', category: 'Music', monthlyAmount: 11, icon: '🌊' },
  // Fitness
  { id: 'peloton', name: 'Peloton', category: 'Fitness', monthlyAmount: 44, icon: '🚴' },
  { id: 'apple-fitness-plus', name: 'Apple Fitness+', category: 'Fitness', monthlyAmount: 10, icon: '🏋' },
  { id: 'gym-membership', name: 'Gym Membership', category: 'Fitness', monthlyAmount: 40, icon: '💪' },
  // Productivity
  { id: 'microsoft-365', name: 'Microsoft 365', category: 'Productivity', monthlyAmount: 10, icon: '📊' },
  { id: 'adobe-cc', name: 'Adobe Creative Cloud', category: 'Productivity', monthlyAmount: 55, icon: '🎨' },
  { id: 'icloud-plus', name: 'iCloud+', category: 'Productivity', monthlyAmount: 3, icon: '☁' },
  // News & Other
  { id: 'nyt', name: 'New York Times', category: 'News & Other', monthlyAmount: 17, icon: '📰' },
  { id: 'spotify-family', name: 'Spotify Premium (Family)', category: 'News & Other', monthlyAmount: 17, icon: '👪' },
  { id: 'youtube-premium', name: 'YouTube Premium', category: 'News & Other', monthlyAmount: 14, icon: '▶' },
  // Gaming
  { id: 'xbox-game-pass', name: 'Xbox Game Pass', category: 'Gaming', monthlyAmount: 15, icon: '🎮' },
  { id: 'playstation-plus', name: 'PlayStation Plus', category: 'Gaming', monthlyAmount: 15, icon: '🕹' },
  { id: 'nintendo-switch-online', name: 'Nintendo Switch Online', category: 'Gaming', monthlyAmount: 4, icon: '🎯' },
];
