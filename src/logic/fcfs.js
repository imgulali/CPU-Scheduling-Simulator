import { SchedulerResult } from './process.js';

export function fcfs(processes) {
    let n = processes.length;
    let pList = processes.map(p => Object.assign(Object.create(Object.getPrototypeOf(p)), p));
    let currentTime = 0;
    let executionOrder = [];

    pList.sort((a, b) => a.arrivalTime - b.arrivalTime);

    for (let i = 0; i < n; i++) {
        let p = pList[i];

        if (currentTime < p.arrivalTime) {
            currentTime = p.arrivalTime;
        }

        executionOrder.push({
            pid: p.pid,
            start: currentTime,
            end: currentTime + p.burstTime
        });

        currentTime += p.burstTime;
        p.completionTime = currentTime;
        p.turnaroundTime = p.completionTime - p.arrivalTime;
        p.waitingTime = p.turnaroundTime - p.burstTime;
    }

    let avgWT = pList.reduce((acc, p) => acc + p.waitingTime, 0) / n;
    let avgTAT = pList.reduce((acc, p) => acc + p.turnaroundTime, 0) / n;

    return new SchedulerResult(pList, executionOrder, avgWT, avgTAT);
}