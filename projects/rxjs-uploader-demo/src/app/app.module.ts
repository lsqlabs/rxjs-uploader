import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { UploaderAdvancedExampleComponent } from './examples/uploader-advanced-example.component';
import { UploaderSimpleExampleComponent } from './examples/uploader-simple-example.component';

@NgModule({
  declarations: [
    AppComponent,
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
