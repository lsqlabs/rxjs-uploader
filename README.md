# RxJs Uploader

A simple RxJs-powered interface for uploading files.

Demo: https://lsqlabs.github.io/rxjs-uploader

## Installation & Basic usage
`npm install rxjs-uploader`

```ts
import { Uploader } from 'rxjs-uploader';

const uploader = new Uploader();

uploader.setRequestUrl('https://www.mocky.io/v2/5185415ba171ea3a00704eed')
    .streamFileUploads()

uploader.selectFiles();
```

## Simple example

```html
<!-- Single file input -->
<input id="file-source" type="file">
<!-- OR multiple file input -->
<input id="file-source" type="file" multiple>
<!-- OR drop zone -->
<div id="file-source"></div>
```

```javascript
const fileUploads$ = new Uploader()
    .setRequestUrl('https://www.mocky.io/v2/5185415ba171ea3a00704eed')
    .streamFileUploads(document.getElementById('file-source'));

// Alternatively, let Uploader use its default <input> (which is hidden and appended to <body>).
// Use it by calling `uploader.selectFiles()`.
// By default, the file input is of type 'single'. You can pass the type you want ('single' or 'multiple')
// to the `Uploader` constructor.

const fileUploads$ = new Uploader('multiple')
    .setRequestUrl('https://www.mocky.io/v2/5185415ba171ea3a00704eed')
    .streamFileUploads();
```

## Advanced example (using Angular)

```javascript
@Component({
    selector: 'uploader-demo',
    template: `
        <button (click)="hiddenFileInput.click()">I'm a prettier alternative to the file input</button>
        <button (click)="uploader.clear()">Cancel all</button>
    `
})
export class UploaderDemoComponent implements AfterViewInit {
    public fileUploads$: Observable<FileUpload[]>;
    public hiddenFileInput = Uploader.createFileInputElement('multiple');
    public uploader = new Uploader()
        .setAllowedContentTypes([ 'image/jpeg', 'image/png', 'application/pdf' ])
        .setFileCountLimit(100)
        .setFileSizeLimitMb(10)
        .setOnFileCountLimitExceeded((fileCountLimit) => alert(
            'You attempted to upload more than the limit of ' + fileCountLimit + ' files'
        ))
        .setRequestOptionsFactory((fileUpload) => {
            return {
                url: 'https://api.myawesomeservice.com/upload/' + fileUpload.name,
                headers: {
                    'content-length': `${fileUpload.file.size}`
                }
            };
        })
        .setAllFilesQueuedCallback((fileUploads) => {
            // It's possible you'll want to do some async stuff before actually executing the upload.
            // You can also manipulate any of the `fileUpload`s before executing them.
            return new Promise((resolve, reject) => {
                // Simulating an HTTP call.
                setTimeout(() => {
                    console.log(fileUploads.length + ' files are ready to upload');
                    resolve(fileUploads);
                }, 1000);
            });
        })
        .setFileUploadedCallback((fileUpload) => {
            console.log(fileUpload.name + ' was uploaded');
            return fileUpload;
        })
        .setAllFilesUploadedCallback((fileUploads) => console.log(fileUploads.length + ' files were uploaded'));
        

    public ngAfterViewInit(): void {
        this.fileUploads$ = this.uploader.streamFileUploads(this.hiddenFileInput);
    }
}
```

## A few key interfaces
```typescript
class Uploader<FileUploadType extends FileUpload> {
    isDraggedOverStream: Observable<boolean>;
    errorStream: Observable<UploaderError>;
    /**
     * Return an `HTMLInputElement` with the specified `accept`, and `className` attributes.
     * If called with no arguments, creates a single-file `input`.
     */
    static createFileInputElement(type?: 'single' | 'multiple', accept?: string, className?: string): HTMLInputElement;
    constructor(config?: IUploaderConfig<FileUploadType> | 'single' | 'multiple');
    /**
     * Take an array of `input[type="file"]`s and an optional array of drop zone target elements and
     * return an observable of `FileUpload`s, executing the uploads immediately (if an `allFilesQueuedCallback`
     * does not exist) or when the `allFilesQueuedCallback` returns or resolves.
     */
    streamFileUploads(...fileSources: FileSource[]): Observable<FileUploadType[]>;
    /**
     * Pipe an empty array to the stream returned by `streamFileUploads`, unsubscribe from all open
     * subscriptions, and set all associated file input elements' `value` property to `''`.
     */
    clear(): void;
    /**
     * Call `.click()` on the default file input element (created and appended to <body> when Uploader
     * is instantiated). Useful when calling `streamFileUploads` with no arguments.
     */
    selectFiles(): void;
    setRequestUrl(url: string): this;
    setRequestOptions(factoryOrOptions?: IUploadRequestOptions | ((fileUpload?: FileUploadType) => Promise<IUploadRequestOptions>)): this;
    setRequestOptionsFactory(factory: (fileUpload?: FileUploadType) => Promise<IUploadRequestOptions>): this;
    patchRequestOptions(requestOptionsPatch?: Partial<IUploadRequestOptions>): this;
    setAllowedContentTypes(contentTypes: string[]): this;
    setFileCountLimit(limit: number | (() => number)): this;
    setFileSizeLimitMb(limit: number): this;
    setOnFileCountLimitExceeded(fn: (fileCountLimit: number) => void): this;
    setAllFilesQueuedCallback(callback: (fileUploads: FileUploadType[]) => FileUploadCallbackReturn<FileUploadType[]>): this;
    setFileUploadedCallback(callback: (fileUpload: FileUploadType) => FileUploadCallbackReturn<FileUploadType>): this;
    setAllFilesUploadedCallback(callback: (fileUploads: FileUploadType[]) => FileUploadCallbackReturn<FileUploadType[]>): this;
    setDragAndDropFlagSelector(selector: string): this;
    setFileUploadType(fileUploadType: any): this;
    getRequestUrl(): string;
    getRequestOptions(): Partial<IUploadRequestOptions>;
    getAllowedContentTypes(): string[];
    getFileCountLimit(): number | (() => number);
    getFileSizeLimitMb(): number;
    getOnFileCountLimitExceeded(): (fileCountLimit: number) => void;
    getAllFilesQueuedCallback(): (fileUploads: FileUploadType[]) => FileUploadCallbackReturn<FileUploadType[]>;
    getFileUploadedCallback(): (fileUpload: FileUploadType) => FileUploadCallbackReturn<FileUploadType>;
    getAllFilesUploadedCallback(): (fileUploads: FileUploadType[]) => FileUploadCallbackReturn<FileUploadType[]>;
    getDragAndDropFlagSelector(): string;
    getFileUploadType(): any;
    getFileInputElements(): HTMLInputElement[];
    getDefaultFileSource(): HTMLInputElement;
    getInputAccept(): string;
}
```

```typescript
interface IFileUpload {
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

type FileUploadCallbackReturn<ReturnType> = Promise<ReturnType> | ReturnType | void;

interface IUploaderConfig<FileUploadType extends FileUpload = FileUpload> {
    allowedContentTypes?: string[];
    fileCountLimit?: number | (() => number);
    fileSizeLimitMb?: number;
    dragAndDropFlagSelector?: string;
    requestUrl?: string;
    requestOptions?: ((fileUpload?: FileUploadType) => Promise<IUploadRequestOptions>) | IUploadRequestOptions;
    fileUploadType?: any;
    allFilesQueuedCallback?: (fileUploads: FileUploadType[]) => FileUploadCallbackReturn<FileUploadType[]>;
    fileUploadedCallback?: (fileUpload: FileUploadType) => FileUploadCallbackReturn<FileUploadType>;
    allFilesUploadedCallback?: (fileUploads: FileUploadType[]) => FileUploadCallbackReturn<FileUploadType[]>;
    onFileCountLimitExceeded?: (fileCountLimit: number) => void;
}

interface IProgress {
    percent: number;
    state: ProgressState;
}

interface IUploadRequestOptions {
    url: string;
    method?: HttpMethod;
    formData?: FormData;
    headers?: { [key: string]: string };
}

enum ProgressState {
    NotStarted,
    Idle,
    InProgress,
    Completed,
    Failed,
    Cancelled
}
```