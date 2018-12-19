import { Uploader } from './rxjs-uploader';
import { debounceTime } from 'rxjs/operators';
import { FileUpload } from './models/file-upload';
import { Observable } from 'rxjs';

const mockUploadUrl = 'https://www.mocky.io/v2/5185415ba171ea3a00704eed';

describe('RxJs Uploader', () => {
    const singleFileInput = Uploader.createFileInputElement();
    const multiFileInput1 = Uploader.createFileInputElement('multiple');
    const multiFileInput2 = Uploader.createFileInputElement('multiple');

    it('should create a file input (single)', () => {
        expect(singleFileInput).toBeTruthy();
        expect(singleFileInput.multiple).toBeFalsy();
    });

    it('should create a file input (multiple)', () => {
        expect(multiFileInput1).toBeTruthy();
        expect(multiFileInput1.multiple).toBeTruthy();
    });

    it('should execute a basic example with an external file input', (done) => {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(new File(['test'], 'test-upload.txt'));
        singleFileInput.files = dataTransfer.files;

        new Uploader()
            .setRequestUrl(mockUploadUrl)
            .streamFileUploads(singleFileInput)
            .pipe(debounceTime(0)) // Convenient way to ignore the initial 'change' event
                                   // during which input.files is empty.
            .subscribe((fileUploads) => {
                expect(fileUploads.length).toBe(1);
                expect(fileUploads[0].name).toBe('test-upload.txt');
                done();
            });

        singleFileInput.dispatchEvent(new Event('change'));
    });

    // Deprecated.
    it('should execute a basic example with the default file input (using the deprecated constructor argument API)', (done) => {
        const uploader = new Uploader('multiple');
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(new File(['test'], 'test-upload'));
        dataTransfer.items.add(new File(['test'], 'test-upload-2'));
        uploader.getDefaultFileSource().files = dataTransfer.files;

        uploader
            .setRequestUrl(mockUploadUrl)
            .streamFileUploads()
            .pipe(debounceTime(0)) // Convenient way to ignore the initial 'change' event
                                   // during which input.files is empty.
            .subscribe((fileUploads) => {
                expect(fileUploads.length).toBe(2);
                expect(fileUploads[1].name).toBe('test-upload-2');
                done();
            });

        uploader.getDefaultFileSource().dispatchEvent(new Event('change'));
    });

    it('should execute a basic multi-file example with the default file input', (done) => {
        const uploader = new Uploader();
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(new File(['test'], 'test-upload-1.txt', { type: 'text/plain' }));
        dataTransfer.items.add(new File(['test'], 'test-upload-2.txt', { type: 'text/plain' }));
        dataTransfer.items.add(new File(['test'], 'test-upload.txt'));
        uploader.getDefaultFileSource().files = dataTransfer.files;

        uploader
            .setRequestUrl(mockUploadUrl)
            .setAllowedContentTypes([ 'text/plain' ])
            .streamFileUploads('multiple')
            .pipe(debounceTime(0)) // Convenient way to ignore the initial 'change' event
                                   // during which input.files is empty.
            .subscribe((fileUploads) => {
                expect(fileUploads.length).toBe(2);
                expect(fileUploads[1].name).toBe('test-upload-2.txt');
                done();
            });

        uploader.getDefaultFileSource().dispatchEvent(new Event('change'));
    });

    it('should execute a basic single-file example with the default file input', (done) => {
        const uploader = new Uploader();
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(new File(['test'], 'test-upload'));
        uploader.getDefaultFileSource().files = dataTransfer.files;

        uploader
            .setRequestUrl(mockUploadUrl)
            .streamFileUploads()
            .pipe(debounceTime(0)) // Convenient way to ignore the initial 'change' event
                                   // during which input.files is empty.
            .subscribe((fileUploads) => {
                expect(fileUploads.length).toBe(1);
                expect(fileUploads[0].name).toBe('test-upload');
                done();
            });

        uploader.getDefaultFileSource().dispatchEvent(new Event('change'));
    });

    it('should execute an advanced example', (done) => {
        const dataTransfer1 = new DataTransfer();
        const dataTransfer2 = new DataTransfer();
        let allFilesQueuedCbCalledTimes = 0;
        const allFilesQueuedCb = async (fileUploads: FileUpload[]) => {
            allFilesQueuedCbCalledTimes++;
            if (allFilesQueuedCbCalledTimes === 1) {
                expect(fileUploads.length).toBe(3);
            } else {
                expect(fileUploads.length).toBe(4);
            }
            expect(fileUploads[0].name).toBe('test-upload-1.txt');
            expect(fileUploads[1].name).toBe('test-upload-2.txt');
            expect(fileUploads.every((fileUpload) => fileUpload.uploadHasStarted === false)).toBe(true);
            expect(allFilesQueuedCbSpy).toHaveBeenCalledTimes(allFilesQueuedCbCalledTimes);
            done();
            return fileUploads;
        };
        const allFilesQueuedCbSpy = jasmine.createSpy('allFilesQueuedCb', allFilesQueuedCb).and.callThrough();
        dataTransfer1.items.add(new File(['test'], 'test-upload-1.txt', { type: 'text/plain' }));
        dataTransfer1.items.add(new File(['test'], 'test-upload-2.txt', { type: 'text/plain' }));
        dataTransfer1.items.add(new File(['test'], 'test-upload-3.txt', { type: 'text/plain' }));
        dataTransfer1.items.add(new File(['test'], 'test-upload-4'));
        multiFileInput1.files = dataTransfer1.files;

        dataTransfer2.items.add(new File(['test'], 'test-upload-5.txt', { type: 'text/plain' }));
        multiFileInput2.files = dataTransfer2.files;

        const uploader = new Uploader()
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
            .setAllowedContentTypes([ 'text/plain' ])
            .setFileCountLimit(100)
            .setFileSizeLimitMb(10)
            .setOnFileCountLimitExceeded((fileCountLimit) => alert(
                'You attempted to upload more than the limit of ' + fileCountLimit + ' files'
            ))
            .setAllFilesQueuedCallback(allFilesQueuedCbSpy)
            .setFileUploadedCallback(async (fileUpload) => {
                console.log(fileUpload.name + ' was uploaded');
                return fileUpload;
            })
            .setAllFilesUploadedCallback((fileUploads) => console.log(fileUploads.length + ' files were uploaded'));

        uploader.streamFileUploads(multiFileInput1, multiFileInput2)
            .pipe(debounceTime(0))
            .subscribe();

        multiFileInput1.dispatchEvent(new Event('change'));
        multiFileInput2.dispatchEvent(new Event('change'));
    });
});
