import { AfterViewInit, Component, ElementRef, ViewChildren } from '@angular/core';
import { uniqBy } from 'lodash';
import { merge, Observable, Subject } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { FileUpload } from './models/file-upload';
import { IUploadRequestOptions } from './models/upload-request-options';
import { Uploader } from './uploader';
import { UploaderFactory } from './uploader.factory';

/**
 * This is a working reference implementation for `Uploader` and should not be imported into
 * a production app.
 */
@Component({
  selector: 'uploader-example',
  template: `
    <div class="uploader-container" [ngClass]="{ 'dragged-over': isDraggedOverStream | async }">

      <div *ngFor="let which of [1,2,3]">
        <hr>
        <label [for]="'input' + which">{{ which }}&nbsp;&nbsp;</label>
        <input [id]="'input' + which" type="file" #fileInput [multiple]="true" [attr.accept]="getInputAccept(which)" />
        <button (click)="clearUploads(which)">Reset</button>
        <button (click)="allowOnly(which, 'application/pdf')">Restrict to PDF</button>
        <div>
          <div *ngFor="let fileUpload of getFileUploadsStream(which) | async">
            {{ fileUpload.name }} => {{ fileUpload.progress.percent }}
          </div>
        </div>
      </div>

      <hr>

    </div>
  `,
  styles: [`
    .uploader-container {
      padding: 40px;
    }
    .dragged-over {
      background: #edeeef;
    }
  `],
  providers: [ UploaderFactory ]
})
export class UploaderExampleComponent implements AfterViewInit {
  @ViewChildren('fileInput') public fileInputs: ElementRef[];
  public fileUploadsStream1: Observable<FileUpload[]>;
  public fileUploadsStream2: Observable<FileUpload[]>;
  public fileUploadsStream3: Subject<FileUpload[]>;
  private _uploader1: Uploader;
  private _uploader2: Uploader;
  private _uploader3: Uploader;
  public getInputAccept = (which: number): string => this[`_uploader${which}`].getInputAccept();
  public clearUploads = (which: number): void => this[`_uploader${which}`].clear();
  public allowOnly = (which: number, type: string): void => this[`_uploader${which}`].setAllowedContentTypes([type]);
  public getFileUploadsStream = (which: number): Observable<FileUpload[]> => this['fileUploadsStream' + which];

  constructor(private _uploaderFactory: UploaderFactory) {
    // Using the factory means we can create as many instances of `Uploader` as we want.
    this._uploader1 = this._uploaderFactory.createUploader();
    this._uploader2 = this._uploaderFactory.createUploader();
    this._uploader3 = this._uploaderFactory.createUploader();

    // Set the allowed content types and configure the form data for the request.
    [ this._uploader1, this._uploader2, this._uploader3 ].forEach((uploader) => {
      uploader
        .setAllowedContentTypes(['*'])
        .setRequestOptions(async (fileUpload: FileUpload) => {
          const requestOptions: IUploadRequestOptions = {
            url: 'https://www.mocky.io/v2/5185415ba171ea3a00704eed',
            formData: {
              filename: fileUpload.name
            }
          };
          return requestOptions;
        });
    });
  }

  // Use `Uploader#isDraggedOverStream` to listen for whether the user is currently
  // dragging files onto any of the registered drop zones.
  public get isDraggedOverStream(): Observable<boolean> {
    return merge(
      this._uploader1.isDraggedOverStream,
      this._uploader2.isDraggedOverStream,
      this._uploader3.isDraggedOverStream
    );
  }

  // Since this all depends on DOM elements, we have to wait until the view initializes.
  public ngAfterViewInit(): void {
    this.fileInputs = Array.from(this.fileInputs);
    this.fileInputs.forEach((fileInput, index) => {

      // Examples of how to execute an upload.
      switch (index) {
        case 0:

          // Using the `streamFileUploads` method.
          // This method will listen for changes on the inputs and drop zones you pass to
          // it, and execute uploads immediately using the request options you set using
          // `setRequestOptions`.
          this.fileUploadsStream1 = this._uploader1.streamFileUploads(
            [ fileInput.nativeElement ], // Inputs.
            [ document ] // Drop zones.
          );

          break;
        case 1:

          // Using the two-step method.
          this.fileUploadsStream2 = this._uploader2
            .registerInput(fileInput.nativeElement)
            .pipe(switchMap((fileUploads) => {
              // You might use this pattern as a way of intercepting the `FileUpload`s before
              // their http upload starts.
              //
              // console.log(fileUploads);
              //
              // When you're ready, execute the upload.
              return this._uploader2.executeFileUploads(fileUploads);
            }));

          break;
        case 2:

          // Using a lower-level method.
          this._uploader3.registerInput(fileInput.nativeElement);
          this.fileUploadsStream3 = new Subject<FileUpload[]>();
          let fileUploads3: FileUpload[] = [];
          fileInput.nativeElement.addEventListener('change', () => {
            this._uploader3
              .uploadFiles(fileInput.nativeElement.files)
              .subscribe((fileUploads) => {
                fileUploads3 = uniqBy([ ...fileUploads3, ...fileUploads ], '_id');
                this.fileUploadsStream3.next(fileUploads3);
              });
          });

          break;
      }
    });

  }
}

