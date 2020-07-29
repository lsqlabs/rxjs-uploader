import { BehaviorSubject, Observable } from 'rxjs';
import { ProgressState } from '../constants/progress-state';
import { IProgress } from './progress';
import { IUploadRequestOptions } from './upload-request-options';
import { HttpMethod } from './http-method';

const uploadSuccessOrRedirectCode = /^[23]/;

export interface IFileUpload {
    /** The state and percentage of the file's upload progress. */
    progress: IProgress;
    /** The response, if any, returned from the HTTP upload call. */
    response: Response;
    /** The code from the HTTP response, if any (e.g. `200`). */
    responseCode: number;
    /** The HTTP response body, if any. */
    responseBody: any;
    /** Set to `true` the first time the file upload is executed. */
    uploadHasStarted: boolean;
    /** Receives a value every time the FileUpload is supposed to execute its HTTP upload. */
    executeStream: Observable<void>;
    /**
     * Receives `false` when `markForRemoval()` is called, telling `Uploader` to delete it
     * from memory and cancel the upload if one is pending.
     */
    isMarkedForRemovalStream: Observable<boolean>;

    /** Returns the value passed to `setRequestOptions()`. */
    readonly requestOptions: IUploadRequestOptions;
    /** A unique identifier for the `FileUpload`. */
    readonly id: Symbol;
    /** The `name` taken from `file.name`. */
    readonly name: string;
    /** Percentage of the upload that has been completed. */
    readonly progressPercentage: number;
    /** Boolean indicating whether an upload is in progress. */
    readonly uploading: boolean;
    /** Boolean indicating whether the upload has completed, either successfully or not. */
    readonly uploaded: boolean;
    /** Boolean indicating whether the upload has succeeded. */
    readonly succeeded: boolean;
    /** Boolean indicating whether the upload has failed. */
    readonly failed: boolean;
    /** Boolean indicating whether the upload has been marked as a failure by `Uploader`. */
    readonly rejected: boolean;
    /** Boolean indicating whether the `FileUpload` has been marked for deletion by `Uploader`. */
    readonly isMarkedForRemoval: boolean;

    /** Used by `Uploader` to mark a `FileUpload` as failed. */
    reject(errorResponse?: any): void;
    /** Set the `IUploadRequestOptions`, used to construct the HTTP request. */
    setRequestOptions(options: IUploadRequestOptions): void;
    /** Used by `Uploader` to construct the HTTP request. */
    createRequest(): {
        method: HttpMethod,
        url: string,
        body: FormData,
        headers?: { [key: string]: string }
    };
    /** Resets the state of the `FileUpload`. */
    reset(): void;
    /** Executes the file upload. */
    retry(): void;
    /** Used by `Uploader` to mark the `FileUpload` for deletion. */
    markForRemoval(): void;
    /** Alias for {@link IFileUpload#markForRemoval}` */
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
    private _executeSubject = new BehaviorSubject<void>(null);
    private _isMarkedForRemovalSubject = new BehaviorSubject<boolean>(false);

    // Public API.
    public progress: IProgress = {
        percent: 0,
        state: ProgressState.NotStarted
    };
    public response: Response;
    public responseCode: number;
    public responseBody: any;
    public uploadHasStarted = false;
    public executeStream: Observable<void> = this._executeSubject.asObservable();
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

    public createRequestFileAsBody(): {
        method: HttpMethod,
        url: string,
        body: File
        headers?: { [key: string]: string }
    } {
        const { url, headers, method} = this._requestOptions;
        // Construct the request.
        return { method, url, body: this.file, headers };
    }

    public reset(): void {
        this._rejected = false;
        this.response = null;
        this.responseBody = null;
        this.responseCode = null;
        this.progress.state = ProgressState.NotStarted;
        this.progress.percent = 0;
    }

    public retry(): void {
        this._executeSubject.next(null);
    }

    public markForRemoval(): void {
        this._isMarkedForRemovalSubject.next(true);
    }

    public remove(): void {
        this.markForRemoval();
    }
}
