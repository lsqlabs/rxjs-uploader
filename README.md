# Rxjs Uploader

A simple RxJs-powered interface for uploading files.

## Basic example

```html
<input id="file-input" type="file">
<!-- OR -->
<input id="file-input" type="file" multiple>
```

```javascript
const fileUploads$ = new Uploader()
    .setRequestUrl('https://www.mocky.io/v2/5185415ba171ea3a00704eed')
    .streamFileUploads(document.getElementById('file-input'));
```

## Drop zone
```html
<div id="drop-zone"></div>
```

```javascript
const fileUploads$ = new Uploader()
    .setRequestUrl('https://www.mocky.io/v2/5185415ba171ea3a00704eed')
    .streamFileUploads(document.getElementById('file-input'));
```

## Advanced example (using Angular)

```html

```

```javascript
@Component({
    selector: 'uploader-demo',
    template: `
        <input id="file-input" type="file">
        <button (click)="hiddenFileInput.click()">I'm a prettier alternative to the file input</button>
        <button (click)="uploader.clear()">Cancel all</button>
    `
})
export class UploaderDemoComponent implements AfterViewInit {
    public uploader = new Uploader();
    public fileUploads$ = new Uploader();
        .setRequestOptions({
            url: 'https://api.myawesomeservice.com/upload'
        })
        .setRequestOptionsFactory((fileUpload) => {
            return {
                url: 'https://api.myawesomeservice.com/upload/' + fileUpload.name
                headers: {
                    'content-length': fileUpload.file
                }
            }
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
                    console.log(fileUploads.length + ' files are ready to upload')
                    resolve(fileUploads)
                }, 1000);
            })
        })
        .setFileUploadedCallback((fileUpload) => console.log(fileUpload.name + ' was uploaded'))
        .setAllFilesUploadedCallback((fileUploads) => console.log(fileUploads.length + ' files were uploaded'))
        

    public ngAfterViewInit(): void {
        this.fileUploads$ = this.uploader
            .streamFileUploads(document.getElementById('file-input'));
    }
}
```