// Hardcoded poll data for UI development

export interface MockPoll {
  id: string;
  title: string;
  description: string | null;
  type: "daily_rating" | "political_rating" | "comparison_voting" | "face_to_face" | "activities";
  duration: number;
  mediaUrl: string | null;
  createdBy: string;
  createdAt: string;
  expiresAt: string;
  candidates?: MockCandidate[];
  voteCounts?: { [key: string]: number };
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
  // Face-Off Comparison Poll (like first image)
  {
    id: "1",
    title: "नेपालको अर्को प्रधानमन्त्री को होला?",
    description: "अर्को चुनावमा को प्रधानमन्त्री बन्ला भन्ने तपाईंको राय",
    type: "face_to_face",
    duration: 24,
    mediaUrl: null,
    createdBy: "admin",
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
    expiresAt: new Date(Date.now() + 21 * 60 * 60 * 1000).toISOString(), // 21 hours from now
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
    ]
  },
  // Singer comparison poll
  {
    id: "6",
    title: "तपाईंलाई बढी मनपर्ने गायक/गायिका को हो?",
    description: "तपाईंको मनपर्ने नेपाली गायक/गायिका छान्नुहोस्",
    type: "comparison_voting",
    duration: 24,
    mediaUrl: null,
    createdBy: "admin",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    expiresAt: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString(), // 22 hours from now
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
    ]
  },

  // Quick Poll (like second image)
  {
    id: "2",
    title: "नेपालको मनपर्ने खाना के हो?",
    description: "तपाईंको मनपर्ने नेपाली खाना छान्नुहोस्",
    type: "comparison_voting",
    duration: 8,
    mediaUrl: null,
    createdBy: "admin",
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
    expiresAt: new Date(Date.now() + 7 * 60 * 60 * 1000).toISOString(), // 7 hours from now
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
    ]
  },

  // Daily Rating Poll
  {
    id: "3",
    title: "आजको मौसम कस्तो लाग्यो?",
    description: "आजको मौसमको बारेमा तपाईंको राय दिनुहोस्",
    type: "daily_rating",
    duration: 24,
    mediaUrl: "https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=400&h=200&fit=crop",
    createdBy: "admin",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString(),
    voteCounts: {
      "gajjab": 45,
      "bekar": 12,
      "yesto_ni_hunxa": 28
    }
  },

  // Political Rating Poll  
  {
    id: "4",
    title: "सरकारको कामकाज कस्तो छ?",
    description: "हालको सरकारको प्रदर्शनलाई मूल्याङ्कन गर्नुहोस्",
    type: "political_rating", 
    duration: 72,
    mediaUrl: null,
    createdBy: "admin",
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 60 * 60 * 60 * 1000).toISOString(),
    voteCounts: {
      "excellent": 23,
      "good": 67,
      "average": 145,
      "poor": 89
    }
  },

  // Another Face-off without timer
  {
    id: "5",
    title: "को बेस्ट फुटबलर हो?",
    description: "विश्वका उत्कृष्ट फुटबलर को हो भन्ने तपाईंको राय",
    type: "comparison_voting",
    duration: 168, // 1 week
    mediaUrl: null,
    createdBy: "admin", 
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 144 * 60 * 60 * 1000).toISOString(),
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
    ]
  }
];

export const mockComments = [
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
  },
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
];