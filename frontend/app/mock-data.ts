export type MediaItem = {
  id: string;
  type: "photo" | "video";
  uploaderName?: string;
  uploadedAt: string;
  url: string;
};

export const venue = {
  name: "Eskisehir Dugun Salonu",
  city: "Eskisehir",
  qrStatus: "not_created" as const,
  monthlyPlan: "Salon Pro",
};

export const mockAuthUsers = [
  {
    role: "salon" as const,
    email: "yetkili",
    password: "12345",
    displayName: "Eskisehir Dugun Salonu Yetkilisi",
  },
  {
    role: "cift" as const,
    email: "emir",
    password: "12345",
    displayName: "Emir Selengil",
  },
];

export const couple = {
  eventName: "Emir Selengil & Saliha Goray",
  groomName: "Emir Selengil",
  brideName: "Saliha Goray",
  loggedInAs: "Emir Selengil",
  eventDate: "23 Mart 2026",
  startTime: "19:00",
  endTime: "23:30",
  paymentApproved: true,
  participantCount: 187,
};

export const mediaItems: MediaItem[] = [
  {
    id: "m1",
    type: "photo",
    uploaderName: "Ayse",
    uploadedAt: "19:21",
    url: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=1600&auto=format&fit=crop",
  },
  {
    id: "m2",
    type: "photo",
    uploaderName: "Mehmet",
    uploadedAt: "19:38",
    url: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1600&auto=format&fit=crop",
  },
  {
    id: "m3",
    type: "video",
    uploaderName: "Elif",
    uploadedAt: "20:10",
    url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=1600&auto=format&fit=crop",
  },
  {
    id: "m4",
    type: "photo",
    uploaderName: "Can",
    uploadedAt: "20:41",
    url: "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?q=80&w=1600&auto=format&fit=crop",
  },
  {
    id: "m5",
    type: "photo",
    uploaderName: "Zeynep",
    uploadedAt: "21:05",
    url: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?q=80&w=1600&auto=format&fit=crop",
  },
  {
    id: "m6",
    type: "video",
    uploaderName: "Merve",
    uploadedAt: "21:30",
    url: "https://images.unsplash.com/photo-1606800052052-a08af7148866?q=80&w=1600&auto=format&fit=crop",
  },
];
