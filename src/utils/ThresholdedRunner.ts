const sleep = ms => new Promise(r => setTimeout(r, ms));

export default class ThresholdedRunner {
    private running: boolean = false;
    private wait: number;

    constructor(
        private min: number,
        private max: number,
        private step: number,
        private concurrency: number,
        private task: () => Promise<boolean>) {
        this.wait = min;
    }

    public isRunning(): boolean {
        return this.running;
    }

    public start(): void {
        this.running = true;
        for (let i = 0; i < this.concurrency; i++) {
            this.run();
        }
    }

    public stop() :void {
        this.running = false;
    }

    private async run() {
        while (this.running) {
            let result = await this.task();
            if (result) {
                this.wait = 0;
            } else {
                this.wait = Math.min(this.max, this.wait + this.step);
                await sleep(this.wait);
            }
        }
    }
}
