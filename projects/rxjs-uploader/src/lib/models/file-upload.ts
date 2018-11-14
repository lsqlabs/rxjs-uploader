import { BehaviorSubject, Observable } from 'rxjs';
import { ProgressState } from '../constants/progress-state';
import { IProgress } from './progress';
import { IUploadRequestOptions } from './upload-request-options';
import { HttpMethod } from './http-method';

const uploadSuccessOrRedirectCode = /^[23]/;

export class FileUpload {
    private _id: Symbol;
    public progress: IProgress = {
        percent: 0,
        state: ProgressState.NotStarted
    };
    public response: Response;
    public responseCode: number;
    public responseBody: any;
    public previewUrl?: string;
    public url?: string;
    public pages?: number;
    public uploadHasStarted = false;
    private _rejected?: boolean;
    private _requestOptions: IUploadRequestOptions = {
        url: null as string,
        method: HttpMethod.Post,
        formData: null
    };

    // Reactive stuff.
    private _executeSubject = new BehaviorSubject<boolean>(true);
    public executeStream: Observable<boolean> = this._executeSubject.asObservable();
    private _isMarkedForRemovalSubject = new BehaviorSubject<boolean>(false);
    public isMarkedForRemovalStream: Observable<boolean> = this._isMarkedForRemovalSubject.asObservable();

    constructor(public file: File, id?: Symbol) {
        this._id = id || Symbol(file.name);
    }

    // Getters.
    public get requestOptions(): IUploadRequestOptions {
        return this._requestOptions;
    }

    public get id(): Symbol {
        return this._id;
    }

    public get name(): string {
        return this.file ? this.file.name : '';
    }

    public get progressPercentage(): number {
        return this.progress.percent;
    }

    public get uploading(): boolean {
        return !this.uploaded && !this.failed && this.progress.state === ProgressState.InProgress;
    }

    public get uploaded(): boolean {
        return !this.failed && this.progress.state === ProgressState.Completed;
    }

    public get succeeded(): boolean {
        return this.uploaded;
    }

    public get failed(): boolean {
        if (!!this.response) {
            if (this.response && this.response.status) {
                return !this.response.status.toString().match(uploadSuccessOrRedirectCode);
            }
        }
        if (!!this.responseCode) {
            return !this.responseCode.toString().match(uploadSuccessOrRedirectCode);
        }
        return this.progress.state === ProgressState.Failed || this.rejected;
    }

    public get rejected(): boolean {
        return this._rejected;
    }

    public get isMarkedForRemoval(): boolean {
        return this._isMarkedForRemovalSubject.getValue();
    }

    public reject(errorResponse?: any): void {
        if (errorResponse) {
            this.response = errorResponse;
        }
        this._rejected = true;
    }

    public setRequestOptions(options: IUploadRequestOptions): void {
        this._requestOptions = {
            ...this._requestOptions,
            ...options
        };
    }

    public createRequest(): {
        method: HttpMethod,
        url: string,
        body: FormData,
        headers?: { [key: string]: string }
    } {
        // Create a new form.
        const { url, method, formData: body, headers } = this._requestOptions;
        const formData: FormData = new FormData();
        formData.append('file', this.file, this.file.name);
        if (body) {
            Object.keys(body).forEach((key) => {
                formData.append(key, body[key]);
            });
        }

        // Construct the request.
        return { method, url, body: formData, headers };
    }

    public reset(): void {
        this._rejected = false;
        this.response = null;
        this.responseBody = null;
        this.responseCode = null;
        this.previewUrl = null;
        this.progress.state = ProgressState.NotStarted;
        this.progress.percent = 0;
    }

    public retry(): void {
        this._executeSubject.next(true);
    }

    public markForRemoval(): void {
        this._isMarkedForRemovalSubject.next(true);
    }

    public remove(): void {
        this.markForRemoval();
    }
}
