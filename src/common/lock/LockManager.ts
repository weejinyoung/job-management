import { v4 as uuidv4 } from 'uuid';
import { Injectable } from '@nestjs/common';
import { AppException } from 'src/common/exception/BaseException';
import { JobResponseCode } from 'src/job/response/JobResponseCode';

interface Lock {
  lockerId: string;
  timestamp: number;
}

@Injectable()
export class LockManager {
  private locks: Map<string, Lock> = new Map();

  async withLock<T>(
    resourceId: string,
    operation: () => Promise<T>,
    timeout = 10000,
  ): Promise<T> {
    const lockerId = uuidv4(); // 고유 락 식별자 생성

    // 락 획득 시도
    const lockAcquired = await this.acquireLock(resourceId, lockerId, timeout);
    if (!lockAcquired) {
      throw new AppException(JobResponseCode.LOCK_ACQUISITION_FAILED);
    }

    try {
      // 락 내에서 함수 실행
      return await operation();
    } finally {
      // 항상 락 해제
      this.releaseLock(resourceId, lockerId);
    }
  }

  async withMultipleLocks<T>(
    resourceIds: string[],
    operation: () => Promise<T>,
    timeout = 10000,
  ): Promise<T> {
    const lockerId = uuidv4();
    const acquiredLocks: string[] = [];

    try {
      // 모든 리소스에 대해 락 획득 시도
      for (const resourceId of resourceIds) {
        const lockAcquired = await this.acquireLock(
          resourceId,
          lockerId,
          timeout,
        );
        if (!lockAcquired) {
          // 하나라도 실패하면 이미 획득한 락 모두 해제
          for (const acquiredResourceId of acquiredLocks) {
            this.releaseLock(acquiredResourceId, lockerId);
          }
          throw new AppException(JobResponseCode.LOCK_ACQUISITION_FAILED);
        }
        acquiredLocks.push(resourceId);
      }

      // 모든 락 획득 성공 시 작업 수행
      return await operation();
    } finally {
      // 모든 락 해제
      for (const resourceId of acquiredLocks) {
        this.releaseLock(resourceId, lockerId);
      }
    }
  }

  private async acquireLock(
    resourceId: string,
    lockerId: string,
    timeout = 10000,
  ): Promise<boolean> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      // 락 확인 및 획득 시도
      const existingLock = this.locks.get(resourceId);

      // 락이 없거나 만료된 경우 (30초 후 자동 만료)
      if (!existingLock || Date.now() - existingLock.timestamp > 30000) {
        // 새 락 설정
        this.locks.set(resourceId, {
          lockerId,
          timestamp: Date.now(),
        });
        return true;
      }

      // 락이 있으면 재시도 전 짧게 대기
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    return false; // 타임아웃으로 인한 락 획득 실패
  }

  private releaseLock(resourceId: string, lockerId: string): boolean {
    const lock = this.locks.get(resourceId);

    // 락이 존재하고 소유자가 일치할 경우에만 해제
    if (lock && lock.lockerId === lockerId) {
      this.locks.delete(resourceId);
      return true;
    }

    return false;
  }
}
