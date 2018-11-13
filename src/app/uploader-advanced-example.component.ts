import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import {
    FileUpload,
    IUploadRequestOptions,
    Uploader,
    UploaderFactory
} from 'rxjs-uploader';

@Component({
    selector: 'uploader-advanced-example',
    template: `
        <div #uploaderZone
            class="uploader-zone"
            [ngClass]="{ 'dragged-over': uploader.isDraggedOverStream | async }">
            <button (click)="selectFiles()">or select files</button>
        </div>

        <div class="mt-4">
            <div *ngFor="let fileUpload of fileUploadsStream | async">
                <h4>{{ fileUpload.name }}</h4>
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
    @ViewChild('uploaderZone') public uploaderZone: ElementRef;
    public fileUploadsStream: Observable<FileUpload[]>;
    public uploader: Uploader;
    public fileInputElement = Uploader.createFileInputElement('multiple');

    constructor(private uploaderFactory: UploaderFactory) {
        this.uploader = this.uploaderFactory.createUploader({
            allowedContentTypes: [ 'image/png', 'image/jpg', 'image/gif' ],
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
