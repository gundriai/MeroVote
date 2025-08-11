export interface Poll {
  id: string;
  title: string;
  description?: string;
  type: string;
  options: {
    id: string;
    name: string;
    votes: number;
    percentage?: number;
  }[];
  totalVotes: number;
  createdAt: string;
  endsAt?: string;
  imageUrl?: string;
  isActive: boolean;
}
