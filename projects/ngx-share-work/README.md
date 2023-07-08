# NgxShareWork

## Configuration

```json
{
  "type": "Request",
  "schedule": "* * * * *",
  "url": "https://urlToRequestWorkFrom.com"
}
```

## Usage

1. Deploy config to a server
2. Add the following provider to your module: `NgxShareWorkService.CONFIG_URL`

```ts
import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';

// @NgModule decorator with its metadata
@NgModule({
  declarations: [YourComponent],
  imports: [],
  providers: [
    {provide: NgxShareWorkService.CONFIG_URL, useValue: "https://your-config.com"}
  ],
})
export class YourModule {
}
```
