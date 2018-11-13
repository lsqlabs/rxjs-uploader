import { Injectable } from '@angular/core';
import { FileUpload } from './models/file-upload';
import { IUploaderConfig } from './models/uploader-config';
import { Uploader } from './rxjs-uploader';

@Injectable()
export class UploaderFactory {
    public createUploader<FileUploadType extends FileUpload = FileUpload>(config?: IUploaderConfig<FileUploadType>): Uploader {
        const uploader = new Uploader<FileUploadType>();
        if (config) {
            if (typeof config.allowedContentTypes !== 'undefined') {
                uploader.setAllowedContentTypes(config.allowedContentTypes);
            }
            if (typeof config.fileCountLimit !== 'undefined') {
                uploader.setFileCountLimit(config.fileCountLimit);
            }
            if (typeof config.fileSizeLimitMb !== 'undefined') {
                uploader.setFileSizeLimitMb(config.fileSizeLimitMb);
            }
            if (typeof config.onFileCountLimitExceeded !== 'undefined') {
                uploader.setOnFileCountLimitExceeded(config.onFileCountLimitExceeded);
            }
            if (typeof config.requestUrl !== 'undefined') {
                uploader.setRequestUrl(config.requestUrl);
            }
            if (typeof config.requestOptions !== 'undefined') {
                uploader.setRequestOptions(config.requestOptions);
            }
            if (typeof config.fileUploadType !== 'undefined') {
                uploader.setFileUploadType(config.fileUploadType);
            }
            if (typeof config.allFilesQueuedCallback !== 'undefined') {
                uploader.setAllFilesQueuedCallback(config.allFilesQueuedCallback);
            }
            if (typeof config.fileUploadedCallback !== 'undefined') {
                uploader.setFileUploadedCallback(config.fileUploadedCallback);
            }
            if (typeof config.allFilesUploadedCallback !== 'undefined') {
                uploader.setAllFilesUploadedCallback(config.allFilesUploadedCallback);
            }
            if (typeof config.dragAndDropFlagSelector !== 'undefined') {
                uploader.setDragAndDropFlagSelector(config.dragAndDropFlagSelector);
            }
        }
        return uploader;
    }
}
