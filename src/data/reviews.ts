const names = [
  "Ravi Kumar", "Sneha Patel", "Arjun Singh", "Priya Sharma", "Karthik R",
  "Meera Nair", "Suresh Kumar", "Anjali Verma", "Rahul Gupta", "Divya Iyer",
  "Vikram Reddy", "Pooja Desai",
];
const services = ["Home Cleaning", "Electrician", "Plumbing", "Car Service", "Salon at Home", "AC Service"];
const comments = [
  "Excellent service, very professional and on time!",
  "Good work but arrived a little late.",
  "Absolutely fantastic — will book again for sure.",
  "Average experience, room for improvement.",
  "The provider was courteous and did a thorough job.",
  "Quick, clean and hassle-free. Highly recommend.",
  "Not satisfied with the quality this time.",
  "Best service I've used on the platform so far!",
];

function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

export interface Review {
  id: string;
  customer: string;
  avatar: string;
  service: string;
  provider: string;
  rating: number;
  comment: string;
  date: string;
  flagged: boolean;
}

export const reviews: Review[] = Array.from({ length: 18 }, (_, i) => {
  const r = rng(i + 61);
  const rating = Math.max(1, Math.min(5, Math.round(3 + r() * 2.4)));
  const d = new Date(2025, 4, 28);
  d.setDate(d.getDate() - Math.floor(r() * 20));
  return {
    id: `REV-${5001 + i}`,
    customer: names[i % names.length],
    avatar: `https://i.pravatar.cc/80?img=${(i % 70) + 1}`,
    service: services[Math.floor(r() * services.length)],
    provider: ["Sparkle Co", "FixIt Pro", "AutoCare", "GlamHouse", "CoolTech"][Math.floor(r() * 5)],
    rating,
    comment: comments[Math.floor(r() * comments.length)],
    date: d.toISOString(),
    flagged: rating <= 2 && r() > 0.4,
  };
});

export const reviewSummary = {
  total: reviews.length,
  average: Math.round((reviews.reduce((a, r) => a + r.rating, 0) / reviews.length) * 10) / 10,
  fiveStar: reviews.filter((r) => r.rating === 5).length,
  flagged: reviews.filter((r) => r.flagged).length,
  distribution: [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  })),
};
