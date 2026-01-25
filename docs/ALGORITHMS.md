# Supported Algorithms

This project implements the following CPU scheduling algorithms.

## 1. First-Come, First-Serve (FCFS)
- **Type**: Non-Preemptive
- **Description**: Processes are executed in the exact order they arrive.
- **Complexity**: O(N log N) (due to sorting by arrival time).
- **Pros**: Simple, fair (no starvation).
- **Cons**: Convoy effect (long process holding CPU delays everyone else).

## 2. Shortest Job First (SJF)
- **Type**: Non-Preemptive
- **Description**: Selects the process with the smallest burst time from the queue of *arrived* processes.
- **Criteria**: Burst Time.
- **Pros**: Minimized average waiting time.
- **Cons**: Starvation possible for long processes.

## 3. Round Robin (RR)
- **Type**: Preemptive
- **Description**: Each process is assigned a fixed time unit (Quantum). If not finished, it goes to the back of the queue.
- **Criteria**: Time Quantum.
- **Pros**: Responsiveness, fair share of CPU.
- **Cons**: Performance depends heavily on Quantum size. High context switching overhead if Quantum is too small.

## 4. Priority Scheduling
- **Type**: Preemptive (in this implementation)
- **Description**: Assigns CPU to the process with the highest priority (lowest number = highest priority). If a new process arrives with higher priority, it preempts the current one.
- **Criteria**: Priority Number.
- **Pros**: Important tasks get done first.
- **Cons**: Starvation (Indefinite Blocking) for low priority processes.

## 5. Shortest Remaining Time First (SRTF)
- **Type**: Preemptive
- **Description**: The preemptive version of SJF. If a new process arrives with a burst time less than the *remaining* time of the current process, it preempts.
- **Criteria**: Remaining Burst Time.
- **Pros**: Optimal average waiting time.
- **Cons**: High overhead (re-calculating on every arrival), starvation possible.
