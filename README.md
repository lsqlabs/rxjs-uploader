# RxJS Uploader

A simple [RxJS](https://github.com/ReactiveX/rxjs)-powered interface for uploading files.

Demo: https://lsqlabs.github.io/rxjs-uploader

Stackblitz: https://stackblitz.com/edit/rxjs-uploader-example

## Installation

`npm install rxjs-uploader`

## Publishing Updates to npm
1. Make sure you are logged in via cli to the npm account that owns the package (if you work at LSQ Funding, check the 1Password vault).
2. Increment the version number in [projects/rxjs-uploader/package.json](https://github.com/lsqlabs/rxjs-uploader/blob/master/projects/rxjs-uploader/package.json) appropriately.
2. `npm run build:lib`
3. `npm run publish`

## Basic Usage

```ts
import { Uploader } from 'rxjs-uploader';

// You may pass configuration options to the Uploader constructor.
const uploader = new Uploader({
    allowedContentTypes: [ 'application/pdf' ]
});

// Or you can set them using setter methods.
uploader.setRequestUrl(
    'https://www.mocky.io/v2/5185415ba171ea3a00704eed'
);

// Once configured, call `streamFileUploads` to ready the uploader.
// The method returns the stream of `FileUpload`s.
const fileUploads$ = uploader.streamFileUploads();

// Calling `streamFileUploads` without arguments tells Uploader to use
// the default file source, a hidden <input type="file"> appended to
// <body> when `Uploader` instantiates. `selectFiles` fires a `click`
// event on that input.
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

// Alternatively, let Uploader use its default <input> (which is
// hidden and appended to <body>).
// Use it by calling `uploader.selectFiles()`.
// By default, the file input is of type 'single'. You can pass the
// type you want ('single' or 'multiple') to streamFileUploads.

const uploader = new Uploader({
    requestUrl: 'https://www.mocky.io/v2/5185415ba171ea3a00704eed'
});
const fileUploads$ = uploader.streamFileUploads('multiple');
uploader.selectFiles();
```

## Advanced example (using Angular)

```javascript
@Component({
    selector: 'uploader-demo',
    template: `
        <button (click)="hiddenFileInput.click()">
            I'm a prettier alternative to the file input
        </button>
        <button (click)="uploader.clear()">Cancel all</button>
    `
})
export class UploaderDemoComponent implements AfterViewInit {
    public fileUploads$: Observable<FileUpload[]>;
    public hiddenFileInput = Uploader.createFileInputElement(
        'multiple'
    );
    public uploader = new Uploader({
        allowedContentTypes: [
            'image/jpeg',
            'image/png',
            'application/pdf'
        ],
        fileCountLimit: 100,
        fileSizeLimitMb: 10,
        uploadFileAsBody: false // Default is false. When true, the file will be the body of the request, instead of being sent as form data.
        onFileCountLimitExceeded: (fileCountLimit) => alert(
            'You attempted to upload more than the limit of '
            + fileCountLimit + ' files'
        ),
        requestOptionsFactory: (fileUpload) => {
            return {
                url: 'https://api.myawesomeservice.com/upload/'
                    + fileUpload.name,
                headers: {
                    'content-length': `${fileUpload.file.size}`
                }
            };
        },
        allFilesQueuedCallback: (fileUploads) => {
            // It's possible you'll want to do some async stuff
            // before actually executing the upload. To do that,
            // simply return a Promise.
            return new Promise((resolve, reject) => {
                // Simulating an HTTP call.
                setTimeout(() => {
                    console.log(
                        fileUploads.length
                        + ' files are ready to upload'
                    );
                    resolve(fileUploads);
                }, 1000);
            });
        },
        fileUploadedCallback: (fileUpload) => {
            console.log(fileUpload.name + ' was uploaded');
            return fileUpload;
        },
        allFilesUploadedCallback: (fileUploads) => {
            console.log(fileUploads.length + ' files were uploaded');
        },
        disallowedContentTypeErrorMessage: (file) => {
            return `${file.name} is an unsupported file type: ${file.type}`;
        },
        disallowedContentSizeErrorMessage: (file) => {
            return `${file.name} is larger than the limit of 100mb.`;
        },
    })

    public ngAfterViewInit(): void {
        this.fileUploads$ = this.uploader
            .streamFileUploads(this.hiddenFileInput);
    }
}
```

## API
```typescript
class Uploader<FileUploadType extends FileUpload> {
    /**
     * A stream indicating whether the user is currently dragging
     * files over any registered drop zone.
     */
    isDraggedOverStream: Observable<boolean>;
    /**
     * A stream of any errors that occur during upload.
     */
    errorStream: Observable<UploaderError>;
    /**
     * Return an `HTMLInputElement` with the specified `accept`, and
     * `className` attributes.
     * If called with no arguments, creates a single-file `input`.
     */
    static createFileInputElement(
        type?: 'single' | 'multiple',
        accept?: string,
        className?: string
    ): HTMLInputElement;

    constructor(
        config?: IUploaderConfig<FileUploadType> | 'single' | 'multiple'
    );

    /**
     * Take one or more `FileSource`s (`input[type="file"]`s or drop
     * zone target elements) and return an observable of
     * `FileUpload`s, executing the uploads immediately (if an
     * `allFilesQueuedCallback` does not exist) or when the
     * `allFilesQueuedCallback` returns or resolves.
     */
    streamFileUploads(
        ...fileSources: FileSource[]
    ): Observable<FileUploadType[]>;
    /**
     * Pipe an empty array to the stream returned by
     * `streamFileUploads`, unsubscribe from all open subscriptions,
     * and set all associated file input elements' `value` property
     * to `''`.
     */
    clear(): void;
    /**
     * Call `.click()` on the default file input element (created and
     * appended to <body> when Uploader is instantiated). Useful when
     * calling `streamFileUploads` with no arguments.
     */
    selectFiles(): void;
    setRequestUrl(url: string): this;
    setRequestOptions(
        factoryOrOptions?: IUploadRequestOptions
            | ((fileUpload?: FileUploadType) => Promise<IUploadRequestOptions>)
    ): this;
    setRequestOptionsFactory(
        factory: (fileUpload?: FileUploadType) =>
            Promise<IUploadRequestOptions>
    ): this;
    patchRequestOptions(
        requestOptionsPatch?: Partial<IUploadRequestOptions>
    ): this;
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
    /**
     * Receives a value every time the FileUpload is supposed to
     * execute its HTTP upload.
     */
    executeStream: Observable<void>;
    /**
     * Receives `false` when `markForRemoval()` is called, telling
     * `Uploader` to delete it from memory and cancel the upload if
     * one is pending.
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
    /**
     * Boolean indicating whether the upload has completed, either
     * successfully or not.
     */
    readonly uploaded: boolean;
    /** Boolean indicating whether the upload has succeeded. */
    readonly succeeded: boolean;
    /** Boolean indicating whether the upload has failed. */
    readonly failed: boolean;
    /**
     * Boolean indicating whether the upload has been marked as a
     * failure by `Uploader`.
     */
    readonly rejected: boolean;
    /**
     * Boolean indicating whether the `FileUpload` has been marked
     * for deletion by `Uploader`.
     */
    readonly isMarkedForRemoval: boolean;

    /** Used by `Uploader` to mark a `FileUpload` as failed. */
    reject(errorResponse?: any): void;
    /**
     * Set the `IUploadRequestOptions`, used to construct the HTTP
     * request.
     */
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

type FileUploadCallbackReturn<ReturnType> =
    Promise<ReturnType> | ReturnType | void;

interface IUploaderConfig<FileUploadType
        extends FileUpload = FileUpload> {
    allowedContentTypes?: string[];
    fileCountLimit?: number | (() => number);
    fileSizeLimitMb?: number;
    dragAndDropFlagSelector?: string;
    requestUrl?: string;
    requestOptions?: ((fileUpload?: FileUploadType) =>
        Promise<IUploadRequestOptions>) | IUploadRequestOptions;
    fileUploadType?: any;
    allFilesQueuedCallback?: (
        fileUploads: FileUploadType[]
    ) => FileUploadCallbackReturn<FileUploadType[]>;
    fileUploadedCallback?: (
        fileUpload: FileUploadType
    ) => FileUploadCallbackReturn<FileUploadType>;
    allFilesUploadedCallback?: (
        fileUploads: FileUploadType[]
    ) => FileUploadCallbackReturn<FileUploadType[]>;
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
