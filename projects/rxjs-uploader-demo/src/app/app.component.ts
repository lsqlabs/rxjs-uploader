import { Component, ViewEncapsulation } from '@angular/core';

@Component({
    selector: 'app-root',
    template: `
        <div class="jumbotron">
            <h1 class="text-center">
                <img src="assets/upload-icon.svg"
                    width="50px"
                    style="margin: -12px 10px 0 0">
                <!-- Font Awesome by Dave Gandy - https://fortawesome.github.com/Font-Awesome [CC BY-SA 3.0 (https://creativecommons.org/licenses/by-sa/3.0)] -->
                RxJs Uploader
            </h1>
        </div>
        <div class="uploader-examples container">
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
    styleUrls: [ './app.component.scss' ],
    encapsulation: ViewEncapsulation.None
})
export class AppComponent { }
