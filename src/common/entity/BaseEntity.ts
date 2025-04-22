export abstract class BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;

  protected constructor() {
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  updateTimestamp(): void {
    this.updatedAt = new Date();
  }
}
