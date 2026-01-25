// Common data structures

export class Process {
    constructor(pid, arrivalTime, burstTime, priority = 0) {
        this.pid = pid;
        this.arrivalTime = Number(arrivalTime);
        this.burstTime = Number(burstTime);
        this.priority = Number(priority);
        this.remainingTime = Number(burstTime);
        this.completionTime = 0;
        this.waitingTime = 0;
        this.turnaroundTime = 0;
        this.startTime = -1; // For Gantt chart
    }
}

export class SchedulerResult {
    constructor(processes, order, averageWaitingTime, averageTurnaroundTime) {
        this.processes = processes; // List of processes with computed times
        this.order = order; // Execution order [{pid, start, end}, ...] for Gantt
        this.averageWaitingTime = averageWaitingTime;
        this.averageTurnaroundTime = averageTurnaroundTime;
    }
}
