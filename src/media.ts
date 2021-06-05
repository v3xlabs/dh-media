


const mediasoup = require('mediasoup');
const config = require("./config");

class MediaHandler{
    nextWorkerIndex: number;
    workers :Array<Object>;


    constructor(){
        this.nextWorkerIndex = 0;
    }

    async initalizeWorkers(){
        const { logLevel, logTags, rtcMinPort, rtcMaxPort } = config.worker;
        console.log('initializeWorkers() creating %d mediasoup workers', config.numWorkers);
      
        for (let i = 0; i < config.numWorkers; ++i) {
          const worker = await mediasoup.createWorker({
            logLevel, logTags, rtcMinPort, rtcMaxPort
          });
      
          worker.once('died', () => {
            console.error('worker::died worker has died exiting in 2 seconds... [pid:%d]', worker.pid);
            setTimeout(() => process.exit(1), 2000);
          });
      
          this.workers.push(worker);
        }
    }

    async createRouter(){
        const worker :any = this.getNextWorker();

        console.log('createRouter() creating new router [worker.pid:%d]', worker.pid);
      
        console.log(`config.router.mediaCodecs:${JSON.stringify(config.router.mediaCodecs)}`)
      
        return await worker.createRouter({ mediaCodecs: config.router.mediaCodecs });
    }

    async getNextWorker(){
        const worker = this.workers[this.nextWorkerIndex];

        if (++this.nextWorkerIndex === this.workers.length) {
          this.nextWorkerIndex = 0;
        }
      
        return worker;
    }
    


}