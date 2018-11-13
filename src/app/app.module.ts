import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { UploaderExamplesComponent } from './uploader-examples.component';
import { UploaderAdvancedExampleComponent } from './uploader-advanced-example.component';
import { UploaderSimpleExampleComponent } from './uploader-simple-example.component';

@NgModule({
  declarations: [
    AppComponent,
    UploaderExamplesComponent,
    UploaderSimpleExampleComponent,
    UploaderAdvancedExampleComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
