export interface FaqItem {
  id: number;
  sectionId: number;
  position: number;
  question: string;
  answer: string;
}

export interface FaqSection {
  id: number;
  position: number;
  name: string;
  items: FaqItem[];
}

