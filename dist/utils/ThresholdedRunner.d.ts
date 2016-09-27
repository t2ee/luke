export default class ThresholdedRunner {
    private min;
    private max;
    private step;
    private concurrency;
    private task;
    private running;
    private wait;
    constructor(min: number, max: number, step: number, concurrency: number, task: () => Promise<boolean>);
    isRunning(): boolean;
    start(): void;
    stop(): void;
    private run();
}
