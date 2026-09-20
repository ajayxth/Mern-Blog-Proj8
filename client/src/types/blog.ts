export interface BlogAuthor {
  personal_info: {
    profile_img: string;
    username: string;
    fullname: string;
  };
}

export interface Blog {
  blog_id: string;
  title: string;
  des: string;
  banner: string;
  activity: {
    total_likes: number;
    total_comments: number;
    total_reads: number;
  };
  tags: string[];
  publishedAt: string;
  author: BlogAuthor;
}

export interface PaginationState {
  results: Blog[];
  page: number;
  totalDocs: number;
}