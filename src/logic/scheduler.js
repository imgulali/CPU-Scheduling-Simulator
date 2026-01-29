import { fcfs } from './fcfs.js';
import { sjf } from './sjf.js';
import { roundRobin } from './rr.js';
import { priorityPreemptive } from './priority.js';
import { srtf } from './srtf.js';

export const Scheduler = {
    FCFS: fcfs,
    SJF: sjf,
    RR: roundRobin,
    PRIORITY: priorityPreemptive,
    SRTF: srtf
};
