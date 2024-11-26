export interface Post {
  id: number;
  user: string;
  text: string;
  created_at: string;
  likes: number[];
  itinerary: {
    id: number;
    place: string;
    trip_type: string;
    budget: number;
    start_date: string;
  };
}