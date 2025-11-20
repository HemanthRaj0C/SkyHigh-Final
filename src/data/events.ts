export type EventType = 'meteor_shower' | 'solar_storm' | 'eclipse' | 'iss_flyover' | 'planetary';

export interface AstronomicalEvent {
  id: string;
  type: EventType;
  title: string;
  description: string;
  startDate: Date;
  endDate?: Date;
  visibility?: string;
  severity?: 'low' | 'medium' | 'high';
  icon: string;
}

export const mockEvents: AstronomicalEvent[] = [
  {
    id: '1',
    type: 'meteor_shower',
    title: 'Geminids Meteor Shower Peak',
    description: 'One of the best meteor showers of the year with up to 120 meteors per hour',
    startDate: new Date('2025-12-13'),
    endDate: new Date('2025-12-14'),
    visibility: 'Northern Hemisphere',
    severity: 'high',
    icon: '☄️',
  },
  {
    id: '2',
    type: 'solar_storm',
    title: 'G2-Class Geomagnetic Storm',
    description: 'Moderate geomagnetic storm may cause aurora visible at mid-latitudes',
    startDate: new Date('2025-11-22'),
    endDate: new Date('2025-11-23'),
    visibility: 'Global',
    severity: 'medium',
    icon: '☀️',
  },
  {
    id: '3',
    type: 'iss_flyover',
    title: 'ISS Visible Pass',
    description: 'International Space Station will be visible for 6 minutes',
    startDate: new Date('2025-11-20T19:45:00'),
    visibility: 'North America',
    severity: 'low',
    icon: '🛰️',
  },
  {
    id: '4',
    type: 'eclipse',
    title: 'Partial Lunar Eclipse',
    description: 'Moon will pass through Earth\'s penumbral shadow',
    startDate: new Date('2025-12-08'),
    visibility: 'Americas, Europe, Africa',
    severity: 'medium',
    icon: '🌑',
  },
  {
    id: '5',
    type: 'planetary',
    title: 'Jupiter at Opposition',
    description: 'Jupiter will be at its closest approach to Earth and fully illuminated',
    startDate: new Date('2025-11-25'),
    visibility: 'Global',
    severity: 'medium',
    icon: '🪐',
  },
  {
    id: '6',
    type: 'meteor_shower',
    title: 'Leonids Meteor Shower',
    description: 'Fast and bright meteors, up to 15 per hour',
    startDate: new Date('2025-11-17'),
    endDate: new Date('2025-11-18'),
    visibility: 'Global',
    severity: 'medium',
    icon: '☄️',
  },
  {
    id: '7',
    type: 'solar_storm',
    title: 'Solar Flare M-Class',
    description: 'Minor radio blackouts possible on sunlit side of Earth',
    startDate: new Date('2025-11-21'),
    visibility: 'Global',
    severity: 'low',
    icon: '☀️',
  },
];
