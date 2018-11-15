import { Component, ViewEncapsulation } from '@angular/core';

/**
 * This is a working reference implementation for `Uploader` and should not be imported into
 * a production app.
 */
@Component({
    selector: 'uploader-examples',
    template: `
        <div class="uploader-examples container">
            <h1 class="text-center mb-5">RxJs Uploader</h1>
            <div class="uploader-example">
                <h2 class="mb-4">Simple example</h2>
                <uploader-simple-example></uploader-simple-example>
            </div>
            <div class="uploader-example">
                <h2 class="mb-4">Advanced example</h2>
                <uploader-advanced-example></uploader-advanced-example>
            </div>
        </div>
    `,
    styleUrls: [ './uploader-examples.component.scss' ],
    encapsulation: ViewEncapsulation.None
})
export class UploaderExamplesComponent { }
