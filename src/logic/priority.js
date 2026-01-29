import { SchedulerResult } from './process.js';

export function priorityPreemptive(processes) {
    let n = processes.length;
    let currentTime = 0;
    let completed = 0;
    let pList = processes.map(p => Object.assign(Object.create(Object.getPrototypeOf(p)), p));
    let executionOrder = [];

    let pq = [];

    const pushToPQ = (idx) => {
        pq.push({ p: pList[idx].priority, idx: idx });
        pq.sort((a, b) => a.p - b.p);
    };

    while (completed < n) {
        for (let i = 0; i < n; i++) {
            if (pList[i].arrivalTime === currentTime) {
                pushToPQ(i);
            }
        }

        if (pq.length > 0) {
            let top = pq[0];
            let idx = top.idx;

            pList[idx].remainingTime--;

            if (executionOrder.length > 0 && executionOrder[executionOrder.length - 1].pid === pList[idx].pid) {
                executionOrder[executionOrder.length - 1].end++;
            } else {
                executionOrder.push({
                    pid: pList[idx].pid,
                    start: currentTime,
                    end: currentTime + 1
                });
            }

            currentTime++;

            if (pList[idx].remainingTime === 0) {
                pq.shift();

                pList[idx].completionTime = currentTime;
                pList[idx].turnaroundTime = pList[idx].completionTime - pList[idx].arrivalTime;
                pList[idx].waitingTime = pList[idx].turnaroundTime - pList[idx].burstTime;
                completed++;
            }
        } else {
            currentTime++;
        }
    }

    let avgWT = pList.reduce((acc, p) => acc + p.waitingTime, 0) / n;
    let avgTAT = pList.reduce((acc, p) => acc + p.turnaroundTime, 0) / n;

    return new SchedulerResult(pList, executionOrder, avgWT, avgTAT);
}
