export default class PromisedQueue<T> {
    private queue;
    private list;
    enqueue(item: T): void;
    dequeue(): Promise<T>;
}
