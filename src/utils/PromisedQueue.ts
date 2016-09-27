import * as Q from 'q';
export default class PromisedQueue<T> {
    private queue: Array<Q.Deferred<T>> = [];
    private list: Array<T> = [];

    public enqueue(item: T): void {
        const d = this.queue.shift();
        if (d) {
            return d.resolve(item);
        }
        this.list.push(item);
    }

    public async dequeue(): Promise<T> {
        const item = this.list.shift();
        if (item) {
            return item;
        }
        const d = Q.defer<T>();
        this.queue.push(d);
        return d.promise;
    }
}
