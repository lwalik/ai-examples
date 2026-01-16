export interface FitnessClass {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly image: string;
  readonly classType: string;
  readonly duration: number;
  readonly difficulty: string;
  readonly price: number;
  readonly studioId: string;
  readonly studioName: string;
  readonly studioAddress: string;
  readonly studioCity: string;
  readonly latitude: number;
  readonly longitude: number;
  readonly dayOfWeek: string;
  readonly time: string;
  readonly date: string;
  readonly instructor: string;
  readonly capacity: number;
  readonly booked: number;
  readonly available: number;
  readonly isAvailable: boolean;
  readonly tags: string[];
}