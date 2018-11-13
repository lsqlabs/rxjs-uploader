import { Injectable } from '@angular/core';
import { FileUpload } from './models/file-upload';
import { IUploaderConfig } from './models/uploader-config';
import { Uploader } from './rxjs-uploader';

@Injectable()
export class UploaderFactory {
    public createUploader<FileUploadType extends FileUpload = FileUpload>(config?: IUploaderConfig<FileUploadType>): Uploader {
        const uploader = new Uploader<FileUploadType>();
        if (config) {
            const {
                allowedContentTypes,
                fileCountLimit,
                fileSizeLimitMb,
                requestOptions,
                fileUploadType,
                fileUploadedCallback,
                allFilesUploadedCallback,
                onFileCountLimitExceeded,
                dragAndDropFlagSelector,
                allFilesQueuedCallback,
            } = config;

            if (typeof allowedContentTypes !== 'undefined') {
                uploader.setAllowedContentTypes(allowedContentTypes);
            }
            if (typeof fileCountLimit !== 'undefined') {
                uploader.setFileCountLimit(fileCountLimit);
            }
            if (typeof fileSizeLimitMb !== 'undefined') {
                uploader.setFileSizeLimitMb(fileSizeLimitMb);
            }
            if (typeof onFileCountLimitExceeded !== 'undefined') {
                uploader.setOnFileCountLimitExceeded(onFileCountLimitExceeded);
            }
            if (typeof requestOptions !== 'undefined') {
                uploader.setRequestOptions(requestOptions);
            }
            if (typeof fileUploadType !== 'undefined') {
                uploader.setFileUploadType(fileUploadType);
            }
            if (typeof allFilesQueuedCallback !== 'undefined') {
                uploader.setAllFilesQueuedCallback(allFilesQueuedCallback);
            }
            if (typeof fileUploadedCallback !== 'undefined') {
                uploader.setFileUploadedCallback(fileUploadedCallback);
            }
            if (typeof allFilesUploadedCallback !== 'undefined') {
                uploader.setAllFilesUploadedCallback(allFilesUploadedCallback);
            }
            if (typeof dragAndDropFlagSelector !== 'undefined') {
                uploader.setDragAndDropFlagSelector(dragAndDropFlagSelector);
            }
        }
        return uploader;
    }
}
