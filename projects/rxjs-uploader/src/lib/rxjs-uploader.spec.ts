import { Uploader } from './rxjs-uploader';
import { debounceTime } from 'rxjs/operators';

describe('RxJs Uploader', () => {
    const singleFileInput = Uploader.createFileInputElement();
    const multiFileInput = Uploader.createFileInputElement('multiple');

    it('should create a file input (single)', () => {
        expect(singleFileInput).toBeTruthy();
        expect(singleFileInput.multiple).toBeFalsy();
    });

    it('should create a file input (multiple)', () => {
        expect(multiFileInput).toBeTruthy();
        expect(multiFileInput.multiple).toBeTruthy();
    });

    it('should execute a basic example with an external file input', (done) => {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(new File(['1', '2', '3'], 'test-upload.txt'));
        singleFileInput.files = dataTransfer.files;

        new Uploader()
            .setRequestUrl('https://www.mocky.io/v2/5185415ba171ea3a00704eed')
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

    it('should execute a basic example with the default file input', (done) => {
        const uploader = new Uploader('multiple');
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(new File(['1', '2', '3'], 'test-upload.txt'));
        dataTransfer.items.add(new File(['4', '5', '6'], 'test-upload-2.txt', { type: 'text/plain' }));
        uploader.getDefaultFileSource().files = dataTransfer.files;

        uploader
            .setRequestUrl('https://www.mocky.io/v2/5185415ba171ea3a00704eed')
            .streamFileUploads()
            .pipe(debounceTime(0)) // Convenient way to ignore the initial 'change' event
                                   // during which input.files is empty.
            .subscribe((fileUploads) => {
                expect(fileUploads.length).toBe(2);
                expect(fileUploads[1].name).toBe('test-upload-2.txt');
                done();
            });

        uploader.getDefaultFileSource().dispatchEvent(new Event('change'));
    });

    it('should execute an advanced example', (done) => {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(new File(['1', '2', '3'], 'test-upload-1.txt', { type: 'text/plain' }));
        dataTransfer.items.add(new File(['4', '5', '6'], 'test-upload-2.txt', { type: 'text/plain' }));
        dataTransfer.items.add(new File(['7', '8', '9'], 'test-upload-3'));
        multiFileInput.files = dataTransfer.files;

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
            .setAllFilesQueuedCallback((fileUploads) => {
                // It's possible you'll want to do some async stuff before actually executing the upload.
                // You can also manipulate any of the `fileUpload`s before executing them.
                return new Promise((resolve, reject) => {
                    // Simulating an HTTP call.
                    setTimeout(() => {
                        resolve(fileUploads);
                    }, 1000);
                });
            })
            .setFileUploadedCallback(async (fileUpload) => {
                console.log(fileUpload.name + ' was uploaded');
                return fileUpload;
            })
            .setAllFilesUploadedCallback((fileUploads) => console.log(fileUploads.length + ' files were uploaded'));

        uploader.streamFileUploads(multiFileInput)
            .pipe(debounceTime(0))
            .subscribe((fileUploads) => {
                expect(fileUploads.length).toBe(2);
                expect(fileUploads[0].name).toBe('test-upload-1.txt');
                expect(fileUploads[1].name).toBe('test-upload-2.txt');
                expect(fileUploads.every((fileUpload) => fileUpload.uploadHasStarted === true));
                done();
            });

        multiFileInput.dispatchEvent(new Event('change'));
    });
});
