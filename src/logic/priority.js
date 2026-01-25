import { SchedulerResult } from './process.js';

export function priorityPreemptive(processes) {
    let n = processes.length;
    let currentTime = 0;
    let completed = 0;
    let pList = processes.map(p => Object.assign(Object.create(Object.getPrototypeOf(p)), p));
    let executionOrder = [];

    // Use a simple array and sort it to simulate Priority Queue (Min Heap)

    let pq = []; // {priority, index}

    const pushToPQ = (idx) => {
        pq.push({ p: pList[idx].priority, idx: idx });
        // Sort ascending by priority so pq[0] is the highest priority (smallest number)
        pq.sort((a, b) => a.p - b.p);
    };

    while (completed < n) {
        // Check arrivals
        for (let i = 0; i < n; i++) {
            if (pList[i].arrivalTime === currentTime) {
                pushToPQ(i);
            }
        }

        if (pq.length > 0) {
            // Get highest priority (smallest number)
            let top = pq[0]; // Peek
            let idx = top.idx;

            // Execute for 1 unit
            pList[idx].remainingTime--;

            // Record execution step (coalescing done later or now?)
            // For now, record every 1 unit, we can optimize later if needed.
            // Optimization: check if last order was same PID
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
                // Remove from PQ
                pq.shift();

                pList[idx].completionTime = currentTime;
                pList[idx].turnaroundTime = pList[idx].completionTime - pList[idx].arrivalTime;
                pList[idx].waitingTime = pList[idx].turnaroundTime - pList[idx].burstTime;
                completed++;
            } else {
                // Process stays in PQ, arrivals checked in next loop
            }
        } else {
            currentTime++; // Idle
            // Add idle to execution order if we want visual gap?
        }
    }

    let avgWT = pList.reduce((acc, p) => acc + p.waitingTime, 0) / n;
    let avgTAT = pList.reduce((acc, p) => acc + p.turnaroundTime, 0) / n;

    return new SchedulerResult(pList, executionOrder, avgWT, avgTAT);
}
