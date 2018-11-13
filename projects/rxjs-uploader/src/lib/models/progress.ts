import { ProgressState } from '../constants/progress-state';

export interface IProgress {
    percent: number;
    state: ProgressState;
}
