import { SchedulerResult } from './process.js';

export function roundRobin(processes, timeQuantum) {
    let n = processes.length;
    let readyQueue = [];
    let currentTime = 0;
    let completed = 0;
    let inQueue = new Array(n).fill(false);
    let executionOrder = []; // To store {pid, start, end}

    // Sort by arrival time initially
    // The loop handles time and queue management

    // Deep copy to avoid modifying original input if reused
    let pList = processes.map(p => Object.assign(Object.create(Object.getPrototypeOf(p)), p));

    // Logic:
    // 1. Check arrivals -> Push to ready queue
    // 2. Execute process for min(quantum, remaining)
    // 3. Check new arrivals
    // 4. Re-queue if not finished

    while (completed < n) {
        // Check for arrivals
        for (let i = 0; i < n; i++) {
            if (pList[i].arrivalTime <= currentTime && pList[i].remainingTime > 0 && !inQueue[i]) {
                readyQueue.push(i);
                inQueue[i] = true;
            }
        }

        if (readyQueue.length === 0) {
            currentTime++;
            continue;
        }

        let idx = readyQueue.shift();

        let execTime = Math.min(timeQuantum, pList[idx].remainingTime);

        // Record execution for Gantt
        executionOrder.push({
            pid: pList[idx].pid,
            start: currentTime,
            end: currentTime + execTime
        });

        pList[idx].remainingTime -= execTime;
        currentTime += execTime;

        // Check for arrivals again
        for (let i = 0; i < n; i++) {
            if (pList[i].arrivalTime <= currentTime && pList[i].remainingTime > 0 && !inQueue[i]) {
                readyQueue.push(i);
                inQueue[i] = true;
            }
        }

        if (pList[idx].remainingTime > 0) {
            readyQueue.push(idx);
        } else {
            completed++;
            pList[idx].completionTime = currentTime;
            pList[idx].turnaroundTime = pList[idx].completionTime - pList[idx].arrivalTime;
            pList[idx].waitingTime = pList[idx].turnaroundTime - pList[idx].burstTime;
        }
    }

    let avgWT = pList.reduce((acc, p) => acc + p.waitingTime, 0) / n;
    let avgTAT = pList.reduce((acc, p) => acc + p.turnaroundTime, 0) / n;

    return new SchedulerResult(pList, executionOrder, avgWT, avgTAT);
}
