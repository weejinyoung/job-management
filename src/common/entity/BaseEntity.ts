export abstract class BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;

  protected constructor() {
    this.createdAt = this.formatDate(new Date());
    this.updatedAt = this.formatDate(new Date());
  }

  updateTimestamp(): void {
    this.updatedAt = this.formatDate(new Date());
  }

  // 날짜를 "YYYY-MM-DD HH:MM:SS" 형식으로 변환
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }
}
