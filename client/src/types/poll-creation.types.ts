import { PollType, PollCategories } from '@/data/mock-polls';

export interface CreateCandidate {
  name: string;
  description?: string;
  imageUrl?: string;
}

export interface CreateVoteOption {
  type: string;
  label: string;
  icon?: string;
  color?: string;
}

export interface CreateComment {
  content: string;
  author: string;
  gajjabCount?: number;
  bekarCount?: number;
  furiousCount?: number;
}

export interface CreateComprehensivePoll {
  title: string;
  description: string;
  type: PollType;
  category?: PollCategories[];
  startDate: string;
  endDate: string;
  mediaUrl?: string;
  createdBy?: string;
  isHidden?: boolean;
  candidates?: CreateCandidate[];
  voteOptions?: CreateVoteOption[];
  comments?: CreateComment[];
  voteCounts?: { [key: string]: number };
}
