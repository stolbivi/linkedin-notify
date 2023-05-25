export class LoadBalanceService {

    readonly DEFAULT_WAIT = Number(`${process.env.BALANCER_DEFAULT_WAIT}`);
    readonly DEFAULT_WAIT_INCREASE = Number(`${process.env.BALANCER_DEFAULT_WAIT_INCREASE}`);
    readonly MAX_REPLAYS = Number(`${process.env.BALANCER_MAX_REPLAYS}`);
    readonly WINDOW_LENGTH = Number(`${process.env.BALANCER_WINDOW_LENGTH}`);
    readonly WINDOW_THRESHOLD = Number(`${process.env.BALANCER_WINDOW_THRESHOLD}`);
    private probes: number[] = [];
    private currentWait: number = this.DEFAULT_WAIT;

    private updateRate() {
        function update(probes: number[], window: number) {
            let index = probes.findIndex(e => e > now - window);
            if (index > 0) {
                probes.splice(0, index);
            }
            probes.push(now);
        }

        let now = new Date().getTime();
        update(this.probes, this.WINDOW_LENGTH);
        console.debug(`Rate: ${this.probes.length}`);
    }

    public async balanceRequests(response: any, replay: (counter: number) => Promise<any>, counter: number) {
        this.updateRate();
        if (this.probes.length >= this.WINDOW_THRESHOLD) {
            let wait = (counter + 1) * this.currentWait;
            console.debug(`Proactively slowing rate [${counter}] [${wait}]: ${this.probes.length}`);
            await new Promise(r => setTimeout(r, wait));
            this.currentWait += this.DEFAULT_WAIT_INCREASE;
            return replay(counter + 1);
        } else if (response.status === 429 && counter < this.MAX_REPLAYS) {
            let wait = (counter + 1) * this.currentWait;
            console.warn(`Too many requests [${counter}] [${wait}]: ${this.probes.length}`);
            await new Promise(r => setTimeout(r, wait));
            this.currentWait += this.DEFAULT_WAIT_INCREASE;
            return replay(counter + 1);
        } else {
            this.currentWait = this.DEFAULT_WAIT;
            return response;
        }
    }

}