# Project Overview

## Introduction
The **CPU Scheduling Visualizer** is a web application designed to demonstrate how different CPU scheduling algorithms work. It provides an interactive interface for users to input processes and visualizes the execution timeline (Gantt Chart) and status queues.

## Architecture
The project follows a strict **Model-View-Controller (ish)** separation, although implemented in Vanilla JavaScript.

### Directory Structure
```
code/
├── index.html          # Entry point
├── main.js            # Vite entry, imports styles and controller
├── src/
│   ├── ui/
│   │   └── controller.js  # Manages DOM, Event Listeners, and Simulation Loop
│   └── logic/
│       ├── process.js     # Data models (Process, SchedulerResult)
│       ├── scheduler.js   # Central export for all algorithms
│       ├── fcfs.js        # First-Come First-Serve implementation
│       ├── sjf.js         # Shortest Job First implementation
│       ├── rr.js          # Round Robin implementation
│       ├── priority.js    # Priority (Preemptive) implementation
│       └── srtf.js        # Shortest Remaining Time First implementation
```

## Key Components

### 1. UI Layer (`src/ui/controller.js`)
The controller acts as the bridge between the user and the logic. It handles:
- **State Management**: Keeps track of `processes`, selected `algorithm`, and current `view`.
- **Input Methods**: Supports Manual Entry, Random Generation, and File Upload.
- **Simulation Loop**: Uses `requestAnimationFrame` to animate the Gantt chart over time.
- **Visualization**: Updates the Ready Queue, Completed Queue, and Process Table in real-time.

### 2. Logic Layer (`src/logic/`)
The logic layer is stateless and pure.
- **Input**: An array of `Process` objects.
- **Output**: A `SchedulerResult` object containing the execution order and calculated metrics (Waiting Time, Turnaround Time).
- **Simulation**: Algorithms run the *entire* simulation upfront. The UI then "plays back" this result.

## Simulation Flow
1. **User Input**: User adds processes (ID, Burst, Arrival, Priority).
2. **Trigger**: User clicks "Simulate".
3. **Calculation**:
   - The Controller calls `Scheduler[AlgorithmName](processes)`.
   - The Algorithm calculates the start/end times for every time slice.
   - Returns a `SchedulerResult`.
4. **Playback**:
   - The Controller sets `state.simulationResult`.
   - The Animation Loop (`tick`) increments `currentTime`.
   - The UI draws the Gantt chart block corresponding to `currentTime` and updates process statuses.
