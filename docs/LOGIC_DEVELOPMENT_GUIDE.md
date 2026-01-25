# Logic Development Guide

This guide is for developers looking to implement new scheduling algorithms or modify existing ones.

## Data Structures

### `Process` Class
Found in `src/logic/process.js`. Represents a single process.
```javascript
class Process {
    constructor(pid, arrivalTime, burstTime, priority = 0) {
        this.pid = pid;              // Unique Identifier (String/Number)
        this.arrivalTime = Number;   // Time when process arrives
        this.burstTime = Number;     // CPU time required
        this.priority = Number;      // Lower number might mean higher priority (depends on algo)
        
        // Mutable properties for calculation
        this.remainingTime = Number; // Tracks remaining burst
        this.completionTime = 0;     // Time when process finishes
        this.waitingTime = 0;        // Total time spent in ready queue
        this.turnaroundTime = 0;     // Completion Time - Arrival Time
    }
}
```

### `SchedulerResult` Class
The standard output format for all algorithms.
```javascript
class SchedulerResult {
    constructor(processes, order, averageWaitingTime, averageTurnaroundTime) {
        this.processes = []; // Array of Process objects with final stats filled
        this.order = [];     // Array of execution blocks
        this.avgWT = 0;
        this.avgTAT = 0;
    }
}
```

#### Execution Order Format
The `order` array is crucial for the Gantt Chart. It describes *when* a process ran.
```javascript
[
    { pid: "P1", start: 0, end: 3 },
    { pid: "P2", start: 3, end: 5 },
    ...
]
```
*Note: Gaps (IDLE time) do not need to be explicitly in the order array, but the UI handles them better if logic is consistent.*

## Implementing a New Algorithm

1. **Create a File**: Create `src/logic/myNewAlgo.js`.
2. **Define Function**: Export a function that accepts an array of processes.
   ```javascript
   import { SchedulerResult } from './process.js';

   export function myNewAlgo(processes) {
       // 1. Deep Copy Input (Crucial!)
       let pList = processes.map(p => Object.assign(Object.create(Object.getPrototypeOf(p)), p));
       
       let executionOrder = [];
       let currentTime = 0;
       
       // 2. Implement Scheduling Logic
       // ... your logic here ...

       // 3. Calculate Averages
       let avgWT = ...
       let avgTAT = ...

       // 4. Return Result
       return new SchedulerResult(pList, executionOrder, avgWT, avgTAT);
   }
   ```
3. **Register Algorithm**:
   - Open `src/logic/scheduler.js`.
   - Import your function.
   - Add it to the `Scheduler` object.
   ```javascript
   export const Scheduler = {
       // ... existing
       MY_ALGO: myNewAlgo
   };
   ```
4. **Update UI**:
   - Open `index.html`.
   - Add an `<option value="MY_ALGO">My Algorithm</option>` to the `#homeAlgorithm` select box.

## Best Practices
- **Immutability**: Never modify the input `processes` array directly. Always map and clone.
- **Time Complexity**: While the simulation runs client-side, efficient algorithms (O(N log N)) are preferred over O(N^2) for smoother UX with large inputs.
- **Edge Cases**:
  - Handle `arrivalTime > 0`.
  - Handle gaps where no process is ready (IDLE time).
  - Handle duplicate priorities (define a tie-breaking rule, usually FCFS).
