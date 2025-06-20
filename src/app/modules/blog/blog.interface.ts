export interface IBlog {
  title: string;
  content: string;
  image: string;
  hashTags: string[];           // changed to flexible array
  author: string;               // author name or ID
  createdAt: Date;              // timestamp for creation
  updatedAt?: Date;             // optional last modified time
  likes?: number;              // like count
//   slug?: string;               // for SEO-friendly URL (e.g., "/blogs/my-first-post")
//   isPublished?: boolean;       // publish status
}
