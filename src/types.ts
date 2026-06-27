export interface Fragrance {
  id: string;
  name: string;
  arabicName: string;
  type: string;
  typeAr: string;
  notes: string[];
  notesAr: string[];
  description: string;
  descriptionAr: string;
  price: number;
  image: string;
  volume: string;
  rating: number;
  reviewsCount: number;
  story: string;
  storyAr: string;
  isNew?: boolean;
}

export interface CartItem {
  fragrance: Fragrance;
  quantity: number;
  size: '50ml' | '100ml';
}

export interface Ingredient {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
}

export interface GiftSet {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  price: number;
  items: string[];
  itemsAr: string[];
  image: string;
}

export interface Testimonial {
  id: string;
  quote: string;
  quoteAr: string;
  author: string;
  authorAr: string;
  location: string;
  locationAr: string;
  rating: number;
}
