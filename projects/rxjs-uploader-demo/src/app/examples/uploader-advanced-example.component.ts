import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import {
    FileUpload,
    IUploadRequestOptions,
    Uploader,
} from 'rxjs-uploader';
import { UploaderFactory } from '../rxjs-uploader.factory';

@Component({
    selector: 'uploader-advanced-example',
    template: `
        <div #uploaderZone
            class="uploader-zone"
            [ngClass]="{ 'dragged-over': uploader.isDraggedOverStream | async }">
            <div class="text-center">
                <p>
                    <b>Drag and drop files here</b>
                    <br>
                    (will only accept .png, .jpg, and .gif)
                </p>
                <button (click)="selectFiles()">or select files</button>
            </div>
        </div>

        <div class="mt-4">
            <div *ngFor="let fileUpload of fileUploadsStream | async"
                class="file-upload">
                <h4>
                    <button class="btn btn-primary-outline"
                        (click)="fileUpload.remove()">
                        <b>✕</b>
                    </button>
                    {{ fileUpload.name }}
                </h4>
                <div id="progress" class="progress">
                    <div class="progress-bar progress-bar-striped"
                        role="progressbar"
                        [style.width]="fileUpload.progressPercentage + '%'"
                        [attr.aria-valuenow]="fileUpload.progressPercentage"
                        aria-valuemin="0"
                        aria-valuemax="100">
                    </div>
                </div>
            </div>
        </div>
    `,
    providers: [ UploaderFactory ]
})
export class UploaderAdvancedExampleComponent implements AfterViewInit {
    @ViewChild('uploaderZone', { static: true }) public uploaderZone: ElementRef;
    public fileUploadsStream: Observable<FileUpload[]>;
    public uploader: Uploader;
    public fileInputElement = Uploader.createFileInputElement('multiple');

    constructor(private uploaderFactory: UploaderFactory) {
        this.uploader = this.uploaderFactory.createUploader({
            allowedContentTypes: [ '*', 'image/png', 'image/jpg', 'image/jpeg', 'image/gif' ],
            allFilesQueuedCallback: (fileUploads) =>
                console.log('Files are ready to be uploaded:', fileUploads),
            requestOptions: async (fileUpload: FileUpload) => {
                const formData = new FormData();
                formData.append('filename', fileUpload.name);
                const requestOptions: IUploadRequestOptions = {
                    url: 'https://www.mocky.io/v2/5185415ba171ea3a00704eed',
                    formData
                };
                return requestOptions;
            }
        });
    }

    // Since this all depends on DOM elements, we have to wait until the view initializes.
    public ngAfterViewInit(): void {
        this.fileUploadsStream = this.uploader.streamFileUploads(
            this.fileInputElement,
            this.uploaderZone.nativeElement
        );
    }

    public selectFiles(): void {
        this.fileInputElement.click();
    }
}
