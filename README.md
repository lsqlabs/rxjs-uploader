# RxJs Uploader

A simple RxJs-powered interface for uploading files.

Demo: https://lsqlabs.github.io/rxjs-uploader

## Basic example

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
        .setRequestOptions({
            url: 'https://api.myawesomeservice.com/upload'
        })
        .setRequestOptionsFactory(async (fileUpload) => {
            return {
                url: 'https://api.myawesomeservice.com/upload/' + fileUpload.name,
                headers: {
                    'content-length': `${fileUpload.file.size}`
                }
            };
        })
        .setAllowedContentTypes([ 'image/jpeg', 'image/png', 'application/pdf' ])
        .setFileCountLimit(100)
        .setFileSizeLimitMb(10)
        .setOnFileCountLimitExceeded((fileCountLimit) => alert(
            'You attempted to upload more than the limit of ' + fileCountLimit + ' files'
        ))
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
        .setFileUploadedCallback(async (fileUpload) => {
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
    static createFileInputElement(type?: 'single' | 'multiple', accept?: string, className?: string): HTMLInputElement;
    constructor(config?: IUploaderConfig<FileUploadType> | 'single' | 'multiple');
    streamFileUploads(...fileSources: FileSource[]): Observable<FileUploadType[]>;
    clear(): void;
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
class FileUpload {
    file: File;
    progress: IProgress;
    response: Response;
    responseCode: number;
    responseBody: any;
    url?: string;
    uploadHasStarted: boolean;
    executeStream: Observable<boolean>;
    isMarkedForRemovalStream: Observable<boolean>;
    constructor(file: File, id?: Symbol);
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
        method: HttpMethod;
        url: string;
        body: FormData;
        headers?: {
            [key: string]: string;
        };
    };
    reset(): void;
    retry(): void;
    markForRemoval(): void;
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