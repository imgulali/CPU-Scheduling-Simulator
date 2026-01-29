import { SchedulerResult } from './process.js';

export function sjf(processes) {
    let n = processes.length;
    let pList = processes.map(p => Object.assign(Object.create(Object.getPrototypeOf(p)), p));
    let currentTime = 0;
    let completed = 0;
    let executionOrder = [];
    let isCompleted = new Array(n).fill(false);

    while (completed < n) {
        let idx = -1;
        let minBurst = Infinity;

        for (let i = 0; i < n; i++) {
            if (pList[i].burstTime < minBurst) {
                minBurst = pList[i].burstTime;
                idx = i;
            }
        }

        if (idx !== -1) {
            let p = pList[idx];

            executionOrder.push({
                pid: p.pid,
                start: currentTime,
                end: currentTime + p.burstTime
            });

            currentTime += p.burstTime;
            p.completionTime = currentTime;
            p.turnaroundTime = p.completionTime - p.arrivalTime;
            p.waitingTime = p.turnaroundTime - p.burstTime;

            isCompleted[idx] = true;
            completed++;
        } else {
            currentTime++;
        }
    }

    let avgWT = pList.reduce((acc, p) => acc + p.waitingTime, 0) / n;
    let avgTAT = pList.reduce((acc, p) => acc + p.turnaroundTime, 0) / n;

    return new SchedulerResult(pList, executionOrder, avgWT, avgTAT);
}
