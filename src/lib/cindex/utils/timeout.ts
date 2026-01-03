/**
 * Timeout Utility
 * Wraps promises with a timeout to prevent indefinite hanging
 */

export class TimeoutError extends Error {
    constructor(message: string, public readonly timeoutMs: number) {
        super(message);
        this.name = "TimeoutError";
    }
}

/**
 * Wrap a promise with a timeout
 * @param promise The promise to wrap
 * @param timeoutMs Timeout in milliseconds
 * @param errorMessage Optional custom error message
 * @returns Promise that rejects with TimeoutError if timeout is exceeded
 */
export function withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number,
    errorMessage?: string
): Promise<T> {
    return Promise.race([
        promise,
        new Promise<T>((_, reject) => {
            setTimeout(() => {
                reject(
                    new TimeoutError(
                        errorMessage ||
                            `Operation timed out after ${timeoutMs}ms`,
                        timeoutMs
                    )
                );
            }, timeoutMs);
        }),
    ]);
}
