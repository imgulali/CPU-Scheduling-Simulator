import { Process } from '../logic/process.js';
import { Scheduler } from '../logic/scheduler.js';

// --- STATE ---
const state = {
    view: 'home', // home, input, results
    method: 'Manual',
    algorithm: 'FCFS',
    processes: [], // {id, burst, arrival, priority} (raw input)
    simulationResult: null, // Full calculated result

    // Animation State
    currentTime: 0,
    isPlaying: false,
    speed: 1, // Multiplier for step
    animationId: null,
    maxTime: 0,
    completedPids: []
};

// --- DOM ELEMENTS ---
const views = {
    home: document.getElementById('view-home'),
    input: document.getElementById('view-input'),
    results: document.getElementById('view-results'),
};

// Home Elements
const homeInputMethod = document.getElementById('homeInputMethod');
const homeAlgorithm = document.getElementById('homeAlgorithm');
const homeStartBtn = document.getElementById('homeStartBtn');
const homeExitBtn = document.getElementById('homeExitBtn');

// Input Elements
const inputSubtitle = document.getElementById('inputSubtitle');
const inputSections = {
    Manual: document.getElementById('inputSectionManual'),
    File: document.getElementById('inputSectionFile'),
    Random: document.getElementById('inputSectionRandom'),
};
const quantumSection = document.getElementById('quantumSection');
const timeQuantumInput = document.getElementById('timeQuantum');
const processCountSpan = document.getElementById('processCount');
const processTableContainer = document.getElementById('processTableContainer');
const inputProcessList = document.getElementById('inputProcessList');
const inputBackBtn = document.getElementById('inputBackBtn');
const inputSimulateBtn = document.getElementById('inputSimulateBtn');

const manualId = document.getElementById('manualId');
const manualBurst = document.getElementById('manualBurst');
const manualArrival = document.getElementById('manualArrival');
const manualPriority = document.getElementById('manualPriority');
const manualAddBtn = document.getElementById('manualAddBtn');
const randomGenerateBtn = document.getElementById('randomGenerateBtn');
const fileInput = document.getElementById('fileInput');
const fileError = document.getElementById('fileError');

// Results & Simulation Elements
const resultsBackBtn = document.getElementById('resultsBackBtn');
const playPauseBtn = document.getElementById('playPauseBtn');
const resetBtn = document.getElementById('resetBtn');
const speedBtns = document.querySelectorAll('.speed-btn');
const timeDisplay = document.getElementById('timeDisplay');
const maxTimeDisplay = document.getElementById('maxTimeDisplay');

const ganttChart = document.getElementById('ganttChart');
const midTime = document.getElementById('midTime');
const endTime = document.getElementById('endTime');

const readyQueueEl = document.getElementById('readyQueue');
const completedQueueEl = document.getElementById('completedQueue');
const activeProcessEl = document.getElementById('activeProcess');

const avgWtSpan = document.getElementById('avgWt');
const avgTatSpan = document.getElementById('avgTat');
const resultsBody = document.getElementById('resultsBody');


// --- INITIALIZATION ---
function init() {
    setupEventListeners();
    updateView();
}

// --- EVENT LISTENERS ---
function setupEventListeners() {
    // Home
    homeStartBtn.addEventListener('click', () => {
        state.method = homeInputMethod.value;
        state.algorithm = homeAlgorithm.value;
        state.processes = [];
        setView('input');
    });

    homeExitBtn.addEventListener('click', () => {
        if (confirm("Exit Simulator?")) window.close();
    });

    // Input View
    inputBackBtn.addEventListener('click', () => {
        setView('home');
    });

    inputSimulateBtn.addEventListener('click', runSimulation);
    manualAddBtn.addEventListener('click', addManualProcess);
    randomGenerateBtn.addEventListener('click', generateRandomProcesses);

    // File Input & Drag and Drop
    const dropZone = document.getElementById('fileDropZone');

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) processFile(file);
    });

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
        });
    });

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.add('drag-active');
        });
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.remove('drag-active');
        });
    });

    dropZone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const file = dt.files[0];
        if (file) processFile(file);
    });

    dropZone.addEventListener('click', () => fileInput.click()); // Click to upload



    // Results View
    resultsBackBtn.addEventListener('click', () => {
        stopAnimation(); // Important!
        setView('input');
    });

    playPauseBtn.addEventListener('click', toggleAnimation);
    resetBtn.addEventListener('click', resetAnimation);

    speedBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            speedBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            state.speed = parseFloat(e.target.dataset.speed);
        });
    });
}

// --- VIEW NAVIGATION ---
function setView(viewName) {
    state.view = viewName;
    updateView();
}

function updateView() {
    Object.values(views).forEach(el => el.classList.add('hidden'));
    views[state.view].classList.remove('hidden');

    if (state.view === 'input') {
        renderInputScreen();
    }
}

// --- INPUT LOGIC ---
function renderInputScreen() {
    inputSubtitle.textContent = `METHOD: ${state.method.toUpperCase()} | ALGORITHM: ${state.algorithm}`;
    Object.values(inputSections).forEach(el => el.classList.add('hidden'));
    inputSections[state.method].classList.remove('hidden');

    if (state.algorithm === 'RR') {
        quantumSection.classList.remove('hidden');
    } else {
        quantumSection.classList.add('hidden');
    }
    renderProcessList();
}

function renderProcessList() {
    processCountSpan.textContent = `${state.processes.length}/10`;
    inputProcessList.innerHTML = '';

    state.processes.forEach((p, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${p.id}</td>
            <td>${p.burstTime}</td>
            <td>${p.arrivalTime}</td>
            <td>${p.priority}</td>
            <td><button class="remove-btn" data-index="${index}">REMOVE</button></td>
        `;
        inputProcessList.appendChild(tr);
    });

    document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = parseInt(e.target.dataset.index);
            state.processes.splice(idx, 1);
            renderProcessList();
        });
    });

    if (state.processes.length > 0) {
        processTableContainer.classList.remove('hidden');
        inputSimulateBtn.disabled = false;
    } else {
        processTableContainer.classList.add('hidden');
        inputSimulateBtn.disabled = true;
    }
}

// Helper to check for duplicate IDs
function isDuplicateId(id, processList = state.processes) {
    return processList.some(p => p.id === id);
}

// Toast Notification Helper
function showToast(message, type = 'error') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${message}</span>`;

    container.appendChild(toast);

    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.add('exiting');
        toast.addEventListener('animationend', () => {
            toast.remove();
        });
    }, 3000);
}

function addManualProcess() {
    if (state.processes.length >= 10) return showToast("Maximum 10 processes allowed.", 'error');

    // Default ID logic
    let id = manualId.value.trim();
    if (!id) {
        let nextIdx = state.processes.length + 1;
        while (isDuplicateId(`P${nextIdx}`)) {
            nextIdx++;
        }
        id = `P${nextIdx}`;
    }

    if (isDuplicateId(id)) return showToast(`Process ID "${id}" already exists.`, 'error');

    const burst = parseInt(manualBurst.value);
    const arrival = parseInt(manualArrival.value) || 0;
    const priority = parseInt(manualPriority.value) || 0;

    if (!burst || burst <= 0) return showToast("Burst time must be positive.", 'error');
    state.processes.push({ id, burstTime: burst, arrivalTime: arrival, priority });

    manualId.value = ''; manualBurst.value = ''; manualArrival.value = ''; manualPriority.value = '';
    renderProcessList();
    showToast("Process added successfully", 'success');
}

function generateRandomProcesses() {
    state.processes = [];
    const count = Math.floor(Math.random() * 8) + 3;
    for (let i = 0; i < count; i++) {
        let idVal = `P${i + 1}`;
        // Verify unique just in case (though loop guarantees it here)
        state.processes.push({
            id: idVal,
            burstTime: Math.floor(Math.random() * 15) + 1,
            arrivalTime: Math.floor(Math.random() * 10),
            priority: Math.floor(Math.random() * 5) + 1
        });
    }
    renderProcessList();
}



function handleFileDrop(e) {
    const dt = e.dataTransfer;
    const file = dt.files[0];
    processFile(file);
}

function processFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const text = event.target.result;
            const lines = text.split('\n').filter(line => line.trim());
            const newProcesses = [];
            const seenIds = new Set(); // To track duplicates within file

            lines.forEach(line => {
                const parts = line.trim().split(/\s+/);
                if (parts.length >= 2) {
                    const id = parts[0];
                    if (seenIds.has(id)) {
                        throw new Error(`Duplicate ID "${id}" found in file.`);
                    }
                    seenIds.add(id);

                    newProcesses.push({
                        id: id,
                        burstTime: parseInt(parts[1]) || 1,
                        arrivalTime: parseInt(parts[2]) || 0,
                        priority: parseInt(parts[3]) || 0
                    });
                }
            });
            if (newProcesses.length === 0) throw new Error("No valid processes");

            state.processes = newProcesses.slice(0, 10);
            renderProcessList();
            fileError.textContent = "";
            fileInput.value = ''; // Reset input to allow same file re-upload
        } catch (err) {
            fileError.textContent = err.message || "Error parsing file.";
        }
    };
    reader.readAsText(file);
}

// Kept for backward compatibility if needed, but listeners replaced above
function handleFileUpload(e) {
    // Legacy reference, logic moved to processFile
    processFile(e.target.files[0]);
}

// --- ANIMATION LOGIC ---

function runSimulation() {
    if (state.processes.length === 0) return;

    // 1. Calculate Full Result (Pre-calculation)
    const inputObjects = state.processes.map(p => new Process(p.id, p.arrivalTime, p.burstTime, p.priority));
    const quantum = parseInt(timeQuantumInput.value) || 2;

    try {
        let result;
        switch (state.algorithm) {
            case 'FCFS': result = Scheduler.FCFS(inputObjects); break;
            case 'SJF': result = Scheduler.SJF(inputObjects); break;
            case 'RR': result = Scheduler.RR(inputObjects, quantum); break;
            case 'PRIORITY': result = Scheduler.PRIORITY(inputObjects); break;
            case 'SRTF': result = Scheduler.SRTF(inputObjects); break;
        }

        state.simulationResult = result;

        // 2. Setup Animation State
        state.currentTime = 0;
        state.isPlaying = false; // Start paused or auto-play? Let's auto-play.
        state.completedPids = [];

        // Determine Max Time
        if (result.order.length > 0) {
            state.maxTime = result.order[result.order.length - 1].end;
        } else {
            state.maxTime = 10;
        }

        // Init UI
        resetAnimationUI();
        avgWtSpan.textContent = result.averageWaitingTime.toFixed(2);
        avgTatSpan.textContent = result.averageTurnaroundTime.toFixed(2);

        setView('results');
        toggleAnimation(); // Auto-start

    } catch (e) {
        console.error(e);
        showToast("Simulation Error: " + e.message, 'error');
    }
}

function resetAnimation() {
    if (state.animationId) cancelAnimationFrame(state.animationId);
    state.currentTime = 0;
    state.isPlaying = false;
    playPauseBtn.textContent = 'PLAY';
    state.completedPids = [];
    resetAnimationUI();
}

function resetAnimationUI() {
    timeDisplay.textContent = '0';
    maxTimeDisplay.textContent = state.maxTime;

    midTime.textContent = Math.round(state.maxTime / 2);
    endTime.textContent = state.maxTime;

    ganttChart.innerHTML = '';
    readyQueueEl.innerHTML = '<span class="text-muted-foreground">[ EMPTY ]</span>';
    completedQueueEl.innerHTML = '<span class="text-muted-foreground">[ NONE ]</span>';
    activeProcessEl.textContent = 'IDLE';
    resultsBody.innerHTML = ''; // Table

    // Populate Table with Initial State
    state.simulationResult.processes.forEach(p => {
        const tr = document.createElement('tr');
        tr.id = `row-${p.pid}`;
        tr.innerHTML = `
            <td>${p.pid}</td>
            <td>${p.arrivalTime}</td>
            <td>${p.burstTime}</td>
            <td>${p.priority}</td>
            <td class="wt-cell">0</td>
            <td class="tat-cell">0</td>
            <td class="status-cell text-muted-foreground">WAIT</td>
        `;
        resultsBody.appendChild(tr);
    });
}

function toggleAnimation() {
    if (state.isPlaying) {
        state.isPlaying = false;
        playPauseBtn.textContent = 'PLAY';
        if (state.animationId) cancelAnimationFrame(state.animationId);
    } else {
        if (state.currentTime >= state.maxTime) resetAnimation();
        state.isPlaying = true;
        playPauseBtn.textContent = 'PAUSE';
        lastFrameTime = performance.now();
        requestAnimationFrame(tick);
    }
}

function stopAnimation() {
    state.isPlaying = false;
    if (state.animationId) cancelAnimationFrame(state.animationId);
}

let lastFrameTime = 0;
function tick(timestamp) {
    if (!state.isPlaying) return;

    const delta = (timestamp - lastFrameTime) / 1000; // Seconds
    lastFrameTime = timestamp;

    // Speed factor: e.g. 1x = 1 sec simulation per real sec? 
    // Usually sims run faster. Let's say 1 unit time = 1 real second is too slow.
    // Let's say 1x speed => 5 simulation time units per second.
    const timeStep = delta * (2 * state.speed);

    state.currentTime += timeStep;

    if (state.currentTime >= state.maxTime) {
        state.currentTime = state.maxTime;
        state.isPlaying = false;
        playPauseBtn.textContent = 'PLAY';
        renderSimulationFrame();
        return;
    }

    renderSimulationFrame();
    state.animationId = requestAnimationFrame(tick);
}

function renderSimulationFrame() {
    const curTime = state.currentTime;
    timeDisplay.textContent = Math.floor(curTime);

    const result = state.simulationResult;

    // 1. Identify Running Process
    let runningBlock = null;
    // Find the block that overlaps with current time
    for (const block of result.order) {
        if (curTime >= block.start && curTime < block.end) {
            runningBlock = block;
            break;
        }
    }

    // Update Active Indicator
    if (runningBlock) {
        activeProcessEl.textContent = runningBlock.pid;
    } else {
        activeProcessEl.textContent = 'IDLE';
    }

    // 2. Update Gantt Chart
    // We can clear and redraw, OR perform delta updates. 
    // Redrawing everything is easier for correctness but expensive? 
    // With < 100 DOM nodes it's fine.
    // BUT to make it look smooth (filling bars), we should draw blocks up to current time.

    // 2. Update Gantt Chart
    ganttChart.innerHTML = '';

    // Draw Gaps/Idle explicitly
    let lastEnd = 0;

    // We need to iterate chronologically to find gaps. `result.order` is sorted by start time usually.
    // Let's assume it is.

    for (const block of result.order) {
        if (block.start > curTime) break; // Future block, but what if there's a gap before it?

        // Check for gap before this block
        if (block.start > lastEnd) {
            // There is a gap from lastEnd to block.start
            // Is this gap fully visible?
            // renderGap(lastEnd, block.start)
            renderGanttBlock(lastEnd, block.start, 'IDLE', 'gap');
        }

        // Render current block
        // Cap end time at curTime
        let renderEnd = (block.end > curTime) ? curTime : block.end;
        renderGanttBlock(block.start, renderEnd, block.pid, 'process', block.pid);

        // Update lastEnd
        // Note: result.order might have overlaps in some weird logic, but usually scheduling is non-overlapping for 1 CPU.
        // If overlapping (e.g. multi-core?), this logic breaks. Assuming single CPU non-overlapping.
        if (block.end > lastEnd) lastEnd = block.end;
    }

    // Check for trailing gap if curTime > lastEnd (e.g. we are waiting for something but nothing scheduled?)
    // Usually scheduler stops at maxTime. If curTime > lastEnd, it means we are idling at the end?
    if (curTime > lastEnd) {
        renderGanttBlock(lastEnd, curTime, 'IDLE', 'gap');
    }

    function renderGanttBlock(start, end, text, type, pid = null) {
        if (end <= start) return;

        const leftPct = (start / state.maxTime) * 100;
        const widthPct = ((end - start) / state.maxTime) * 100;

        const el = document.createElement('div');
        el.style.left = `${leftPct}%`;
        el.style.width = `${widthPct}%`;

        if (type === 'gap') {
            el.className = 'gantt-block gantt-gap';
            el.textContent = 'IDLE';
        } else {
            const colorId = (getColorId(pid) % 10) + 1;
            el.className = `gantt-block color-${colorId}`;
            el.textContent = text;
        }

        ganttChart.appendChild(el);
    }

    // 3. Update Ready Queue (Arrival <= curTime AND Not Completed)
    // Wait, "Not Completed" is tricky. A process is in ready queue if arrived, not currently running, and not done.
    // Actually, simple Logic:
    // Ready = Arrived <= CurTime AND (RemainingTime > 0)
    // AND (Running != Process) ? 
    // In strict sense, Running process is also "Ready" (state transition Ready->Running), but usually we separate them visually.

    // We need to track remaining time dynamically? 
    // Or we can just infer from result.

    // Let's use `result.order` to see what has been done up to now.
    // Total burst executed for each PID up to curTime.
    const executedMap = {};
    result.order.forEach(block => {
        if (block.end <= curTime) {
            executedMap[block.pid] = (executedMap[block.pid] || 0) + (block.end - block.start);
        } else if (block.start < curTime) {
            // Partial execution
            executedMap[block.pid] = (executedMap[block.pid] || 0) + (curTime - block.start);
        }
    });

    readyQueueEl.innerHTML = '';
    const readyProcs = [];
    const doneProcs = [];

    state.processes.forEach(p => {
        // This 'p' is raw input. Need burstTime.
        // We assume PID is consistent.
        const arrived = p.arrivalTime <= curTime;
        if (!arrived) return;

        const completedBurst = executedMap[p.id] || 0;
        const isFinished = completedBurst >= p.burstTime - 0.01; // Epsilon
        const isRunning = (runningBlock && runningBlock.pid == p.id);

        if (isFinished) {
            doneProcs.push(p.id);
        } else if (!isRunning) {
            readyProcs.push(p.id);
        }

        // Update Table Status
        const row = document.getElementById(`row-${p.id}`);
        if (row) {
            const statusCell = row.querySelector('.status-cell');
            const tapCell = row.querySelector('.tat-cell');
            const wtCell = row.querySelector('.wt-cell');

            if (isFinished) {
                statusCell.textContent = 'DONE';
                statusCell.className = 'status-cell status-done';
                // Show final stats from result
                const resP = result.processes.find(rp => rp.pid == p.id);
                if (resP) {
                    tapCell.textContent = resP.turnaroundTime;
                    wtCell.textContent = resP.waitingTime;
                }
            } else if (isRunning) {
                statusCell.textContent = 'RUNNING';
                statusCell.className = 'status-cell status-running';
            } else {
                statusCell.textContent = 'WAIT';
                statusCell.className = 'status-cell text-muted-foreground';
            }
        }
    });

    if (readyProcs.length === 0) readyQueueEl.innerHTML = '<span class="text-muted-foreground">[ EMPTY ]</span>';
    else {
        readyQueueEl.innerHTML = '';
        readyProcs.forEach(pid => {
            const div = document.createElement('div');
            div.className = 'queue-item';
            div.textContent = pid;
            readyQueueEl.appendChild(div);
        });
    }

    if (doneProcs.length === 0) completedQueueEl.innerHTML = '<span class="text-muted-foreground">[ NONE ]</span>';
    else {
        completedQueueEl.innerHTML = '';
        doneProcs.forEach(pid => {
            const div = document.createElement('div');
            div.className = 'queue-item done';
            div.textContent = pid;
            completedQueueEl.appendChild(div);
        });
    }
}

function getColorId(pid) {
    if (typeof pid === 'number') return pid;
    let hash = 0;
    const str = String(pid);
    for (let i = 0; i < str.length; i++) hash += str.charCodeAt(i);
    return Math.abs(hash);
}

// Start
init();
