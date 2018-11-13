import { AfterViewInit, Component } from '@angular/core';
import { Uploader, HttpMethod } from 'rxjs-uploader';

@Component({
    selector: 'uploader-simple-example',
    template: `
        <div><input id="file-input" type="file"></div>
        <div class="mt-3">
            <button class="btn-danger" onclick="rxjsUploader.clear()">Reset</button>
        </div>
        <div class="mt-4">
            <div id="files"></div>
            <div id="progress" class="progress">
                <div class="progress-bar progress-bar-striped"
                    role="progressbar"
                    aria-valuenow="0"
                    aria-valuemin="0"
                    aria-valuemax="100">
                </div>
            </div>
        </div>
    `
})
export class UploaderSimpleExampleComponent implements AfterViewInit {
    // Since this all depends on DOM elements, we have to wait until the view initializes.
    public ngAfterViewInit(): void {
        // Make our DOM queries.
        const fileInput = document.getElementById('file-input') as HTMLInputElement;
        const progressBar = document.querySelector('.progress-bar') as HTMLElement;
        const files = document.getElementById('files');

        // Create the uploader and bind it to a global so we can access it from our HTML.
        const uploader = window['rxjsUploader'] = new Uploader();

        // Buld the uploader and create the stream.
        const fileUploads$ = uploader
            .setRequestOptions({ method: HttpMethod.Post, url: '' })
            .setRequestUrl('https://www.mocky.io/v2/5185415ba171ea3a00704eed')
            .setAllFilesUploadedCallback(
                (fileUploads) => alert(`Uploaded ${fileUploads.length} files!`)
            )
            .streamFileUploads(fileInput);

        // Render information about the file uploads in the UI.
        fileUploads$.subscribe((fileUploads) => {
            let visualizerHtml = ``;
            const averageProgress = fileUploads.reduce((acc, curr, index) => {
                return (acc + curr.progressPercentage) / (index + 1);
            }, 0);
            fileUploads.forEach((fileUpload) => {
                visualizerHtml += `<div><h4>${fileUpload.name}</h4></div>`;
            });
            files.innerHTML = visualizerHtml;
            progressBar.style.width = `${averageProgress}%`;
            progressBar.setAttribute('aria-valuenow', `${averageProgress}`);
        });
    }
}
