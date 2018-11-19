import { Injectable } from '@angular/core';
import { FileUpload, IUploaderConfig, Uploader } from 'rxjs-uploader';

@Injectable()
export class UploaderFactory {
    public createUploader<FileUploadType extends FileUpload = FileUpload>(config?: IUploaderConfig<FileUploadType>): Uploader {
        return new Uploader<FileUploadType>(config);
    }
}
