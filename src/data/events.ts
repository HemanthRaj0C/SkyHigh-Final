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
