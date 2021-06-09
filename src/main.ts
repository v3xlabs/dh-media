import "dotenv/config";
import debugModule from "debug";
import { Router, Worker } from "mediasoup/lib/types";
import { createConsumer } from "./createConsumer";
import { createTransport, transportToOptions } from "./createTransport";
import { startMediasoup } from "./startMediasoup";

class main {

    workers: {
        worker: Worker;
        router: Router;}[];
    
    workerIdx = 0;

    constructor()
    {
        try 
        {
            this.workers = await startMediasoup();
        } 
        catch (err) 
        {
            console.log(err);
            throw err;
        }
    }
 
    getNextWorker()
    {
        const w = this.workers[this.workerIdx];
        this.workerIdx++;
        this.workerIdx %= this.workers.length;
        return w;
    };

    createRoom() 
    {
        const { worker, router } = this.getNextWorker();

        return { worker, router, state: {} };
    };
  

  }