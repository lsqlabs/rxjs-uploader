# RxJs Uploader

A simple RxJs-powered interface for uploading files.

Demo: https://lsqlabs.github.io/rxjs-uploader

## Basic example

```html
<input id="file-source" type="file">
```
or
```html
<input id="file-source" type="file" multiple>
```
or
```html
<!-- Drop zone -->
<div id="file-source"></div>
```

```javascript
const fileUploads$ = new Uploader()
    .setRequestUrl('https://www.mocky.io/v2/5185415ba171ea3a00704eed')
    .streamFileUploads(document.getElementById('file-source'));
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
interface IFileUpload {
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