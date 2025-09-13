export interface MockComment {
  id: string;
  pollId: string;
  content: string;
  author: string;
  createdAt: string;
  gajjabCount: number;
  bekarCount: number;
  furiousCount: number;
}

export enum PollCategories {
  ALL = "All",
  DAILY = "Daily",
  POLITICAL = "Political",
  FACE_TO_FACE = "FaceToFace"
}

export enum PollType {
  DAILY_RATING = "daily_rating",
  POLITICAL_RATING = "political_rating",
  COMPARISON_VOTING = "comparison_voting",
  FACE_TO_FACE = "face_to_face",
  ACTIVITIES = "activities"
}

export interface MockPoll {
  id: string;
  title: string;
  description: string | null;
  type: PollType;
  category: PollCategories[];
  mediaUrl: string | null;
  startDate: Date;
  endDate: Date;
  isHidden: boolean;
  comments: MockComment[];
  updatedAt: Date;
  createdBy: string;
  createdAt: Date;
  candidates?: MockCandidate[];
  voteCounts?: { [key: string]: number };
  totalComments: number;
  totalVotes: number;
}

export interface MockCandidate {
  id: string;
  pollId: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  voteCount: number;
}

export const mockPolls: MockPoll[] = [
  {
    id: "1",
    title: "नेपालको अर्को प्रधानमन्त्री को होला?",
    description: "अर्को चुनावमा को प्रधानमन्त्री बन्ला भन्ने तपाईंको राय",
    type: PollType.FACE_TO_FACE,
    category: [PollCategories.FACE_TO_FACE, PollCategories.POLITICAL],
    startDate: new Date(Date.now() - 3 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 21 * 60 * 60 * 1000),
    mediaUrl: "",
    createdBy: "admin",
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    isHidden: false,
      comments: [
        {
          id: "1",
          pollId: "1",
          content: "रवि लामिछाने नै उत्तम विकल्प हो",
          author: "राम बहादुर",
          createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          gajjabCount: 12,
          bekarCount: 2,
          furiousCount: 1
        },
        {
          id: "2",
          pollId: "1",
          content: "गगन थापाको नेतृत्व चाहिन्छ",
          author: "सीता देवी",
          createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
          gajjabCount: 8,
          bekarCount: 5,
          furiousCount: 0
        }
      ],
  candidates: [
      {
        id: "1",
        pollId: "1",
        name: "रवि लामिछाने",
        description: "राष्ट्रिय स्वतन्त्र पार्टी",
        imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        voteCount: 145
      },
      {
        id: "2",
        pollId: "1",
        name: "गगन थापा",
        description: "नेपाली कांग्रेस",
        imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
        voteCount: 89
      }
  ],
  totalComments: 2,
  totalVotes: 234
  },
  {
    id: "6",
    title: "तपाईंलाई बढी मनपर्ने गायक/गायिका को हो?",
    description: "तपाईंको मनपर्ने नेपाली गायक/गायिका छान्नुहोस्",
    type: PollType.COMPARISON_VOTING,
    category: [PollCategories.POLITICAL],
    startDate: new Date(Date.now() - 2 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 22 * 60 * 60 * 1000),
    mediaUrl: "",
    createdBy: "admin",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    isHidden: false,
      comments: [],
  candidates: [
      {
        id: "11",
        pollId: "6",
        name: "राजेश पायल राई",
        description: "लोकप्रिय गायक",
        imageUrl: "https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=150&h=150&fit=crop&crop=face",
        voteCount: 120
      },
      {
        id: "12",
        pollId: "6",
        name: "अनीता चलाउने",
        description: "लोकप्रिय गायिका",
        imageUrl: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=150&h=150&fit=crop&crop=face",
        voteCount: 98
      }
  ],
  totalComments: 0,
  totalVotes: 218
  },
  {
    id: "2",
    title: "नेपालको मनपर्ने खाना के हो?",
    description: "तपाईंको मनपर्ने नेपाली खाना छान्नुहोस्",
    type: PollType.COMPARISON_VOTING,
    category: [PollCategories.POLITICAL],
    startDate: new Date(Date.now() - 1 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 7 * 60 * 60 * 1000),
    mediaUrl: "",
    createdBy: "admin",
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now()),
    isHidden: false,
      comments: [
        {
          id: "3",
          pollId: "2",
          content: "मोमो भन्दा राम्रो केहि छैन",
          author: "प्रकाश श्रेष्ठ",
          createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          gajjabCount: 15,
          bekarCount: 1,
          furiousCount: 0
        }
      ],
  candidates: [
      {
        id: "3",
        pollId: "2",
        name: "मोमो",
        description: "नेपालको लोकप्रिय खाना",
        imageUrl: "🥟",
        voteCount: 156
      },
      {
        id: "4",
        pollId: "2",
        name: "चाउचाउ",
        description: "तुरुन्तै बन्ने खाना",
        imageUrl: "🍜",
        voteCount: 89
      }
  ],
  totalComments: 1,
  totalVotes: 245
  },
  {
    id: "3",
    title: "आजको मौसम कस्तो लाग्यो?",
    description: "आजको मौसमको बारेमा तपाईंको राय दिनुहोस्",
    type: PollType.DAILY_RATING,
    category: [PollCategories.DAILY],
    startDate: new Date(Date.now() - 2 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 22 * 60 * 60 * 1000),
    mediaUrl: "https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=400&h=200&fit=crop",
    createdBy: "admin",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now()),
    isHidden: false,
      comments: [],
    voteCounts: {
      "gajjab": 45,
      "bekar": 12,
      "yesto_ni_hunxa": 28
    },
    totalComments: 0,
    totalVotes: 85
  },
  {
    id: "4",
    title: "सरकारको कामकाज कस्तो छ?",
    description: "हालको सरकारको प्रदर्शनलाई मूल्याङ्कन गर्नुहोस्",
    type: PollType.POLITICAL_RATING,
    category: [PollCategories.POLITICAL],
    startDate: new Date(Date.now() - 12 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 60 * 60 * 60 * 1000),
    mediaUrl: "",
    createdBy: "admin",
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now()),
    isHidden: false,
      comments: [],
    voteCounts: {
      "excellent": 23,
      "good": 67,
      "average": 145,
      "poor": 89
    },
    totalComments: 0,
    totalVotes: 324
  },
  {
    id: "5",
    title: "को बेस्ट फुटबलर हो?",
    description: "विश्वका उत्कृष्ट फुटबलर को हो भन्ने तपाईंको राय",
    type: PollType.COMPARISON_VOTING,
    category: [PollCategories.POLITICAL],
    startDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 144 * 60 * 60 * 1000),
    mediaUrl: "",
    createdBy: "admin",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now()),
    isHidden: false,
      comments: [],
  candidates: [
      {
        id: "5",
        pollId: "5",
        name: "मेस्सी",
        description: "अर्जेन्टिना",
        imageUrl: "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=150&h=150&fit=crop&crop=face",
        voteCount: 234
      },
      {
        id: "6",
        pollId: "5",
        name: "रोनाल्डो",
        description: "पोर्चुगल",
        imageUrl: "https://images.unsplash.com/photo-1546554137-f86b9593a222?w=150&h=150&fit=crop&crop=face",
        voteCount: 198
      }
  ],
  totalComments: 0,
  totalVotes: 432
  }
];

