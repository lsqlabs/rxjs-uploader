import { BehaviorSubject, Observable } from 'rxjs';
import { ProgressState } from '../constants/progress-state';
import { IProgress } from './progress';
import { IUploadRequestOptions } from './upload-request-options';
import { HttpMethod } from './http-method';

const uploadSuccessOrRedirectCode = /^[23]/;

export interface IFileUpload {
    progress: IProgress;
    response: Response;
    responseCode: number;
    responseBody: any;
    url?: string;
    uploadHasStarted: boolean;
    executeStream: Observable<boolean>;
    isMarkedForRemovalStream: Observable<boolean>;

    readonly requestOptions: IUploadRequestOptions;
    readonly id: Symbol;
    readonly name: string;
    readonly progressPercentage: number;
    readonly uploading: boolean;
    readonly uploaded: boolean;
    readonly succeeded: boolean;
    readonly failed: boolean;
    readonly rejected: boolean;
    readonly isMarkedForRemoval: boolean;

    reject(errorResponse?: any): void;
    setRequestOptions(options: IUploadRequestOptions): void;
    createRequest(): {
        method: HttpMethod,
        url: string,
        body: FormData,
        headers?: { [key: string]: string }
    };
    reset(): void;
    retry(): void;
    markForRemoval(): void;
    remove(): void;
}

export class FileUpload implements IFileUpload {
    // Private variables.
    private _id: Symbol;
    private _rejected?: boolean;
    private _requestOptions: IUploadRequestOptions = {
        url: null as string,
        method: HttpMethod.Post,
        formData: null
    };
    private _executeSubject = new BehaviorSubject<boolean>(true);
    private _isMarkedForRemovalSubject = new BehaviorSubject<boolean>(false);

    // Public API.
    public progress: IProgress = {
        percent: 0,
        state: ProgressState.NotStarted
    };
    public response: Response;
    public responseCode: number;
    public responseBody: any;
    public url?: string;
    public uploadHasStarted = false;
    public executeStream: Observable<boolean> = this._executeSubject.asObservable();
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
        this.url = null;
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
