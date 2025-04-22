export class CommonHeader {
  static readonly PAGE_TOTAL_PAGES = 'X-Total-Pages';
  static readonly PAGE_TOTAL_ELEMENTS = 'X-Total-Elements';
}

export interface PageMetadata {
  totalElements: number;
  totalPages: number;
  size: number;
  page: number;
}

export class Page<T> {
  readonly data: T[];
  readonly metadata: PageMetadata;

  constructor(data: T[], metadata: PageMetadata) {
    this.data = data;
    this.metadata = metadata;
  }

  toArray(): T[] {
    return this.data;
  }

  getTotalElements(): number {
    return this.metadata.totalElements;
  }

  getTotalPages(): number {
    return this.metadata.totalPages;
  }

  getSize(): number {
    return this.metadata.size;
  }

  getPage(): number {
    return this.metadata.page;
  }
}