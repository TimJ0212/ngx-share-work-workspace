import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { NgxShareWorkService } from './ngx-share-work.service';
import {
  HttpClientTestingModule,
  HttpTestingController,
  TestRequest,
} from '@angular/common/http/testing';
import { Config, Type } from './types';
import { HttpStatusCode } from '@angular/common/http';

/**
 * Prepare service for tests.
 * Calls ngOnInit and spies on it.
 * @param service
 */
function prepareService(service: NgxShareWorkService) {
  expect(service).toBeTruthy();

  spyOn(service, 'ngOnInit').and.callThrough();

  service.ngOnInit();

  expect(service.ngOnInit).toHaveBeenCalled();
}

/**
 * Expect correct config.
 * @param httpTestingController
 * @param configUrlValue
 * @param expectedBody
 */
function expectCorrectConfig(
  httpTestingController: HttpTestingController,
  configUrlValue: string,
  expectedBody: Config,
) {
  const request: TestRequest = httpTestingController.expectOne(configUrlValue);
  request.flush(expectedBody);
  expect(request.request.method).toEqual('GET');
  expect(request.request.url).toEqual(configUrlValue);
}

/**
 * Expect request call to the url of the expectedBody.
 * @param expectedBody
 * @param httpTestingController
 */
function expectRequestCall(
  expectedBody: Config,
  httpTestingController: HttpTestingController,
) {
  tick(+expectedBody.schedule);
  httpTestingController.expectOne(expectedBody.url).flush({});
}

describe('NgxShareWorkService', () => {
  let service: NgxShareWorkService;
  let httpTestingController: HttpTestingController;

  const configUrlValue: string = 'https://urlToGetConfigFrom.eu/config';
  const exampleConfig: Config = {
    type: Type.Request,
    schedule: 1000,
    url: 'https://urlToRequest.tk',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: NgxShareWorkService.CONFIG_URL, useValue: configUrlValue },
      ],
    });
    service = TestBed.inject(NgxShareWorkService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterAll(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load config from injected url', () => {
    prepareService(service);
    expectCorrectConfig(httpTestingController, configUrlValue, exampleConfig);
  });

  it('should handle config correct for one call', fakeAsync(() => {
    prepareService(service);
    expectCorrectConfig(httpTestingController, configUrlValue, exampleConfig);
    expectRequestCall(exampleConfig, httpTestingController);
    // clear task, so that the interval is not called again
    service.clearTask();
  }));

  it('should handle config correct for multiple calls', fakeAsync(() => {
    prepareService(service);
    expectCorrectConfig(httpTestingController, configUrlValue, exampleConfig);
    for (let i = 0; i < 5; i++) {
      expectRequestCall(exampleConfig, httpTestingController);
    }
    // clear task, so that the interval is not called again
    service.clearTask();
  }));

  it('should handle incorrect config', fakeAsync(() => {
    prepareService(service);

    const request: TestRequest =
      httpTestingController.expectOne(configUrlValue);
    expect(() => {
      request.flush({
        foo: 'bar',
        42: '42',
        red: 'green',
      });

      expect(request.request.method).toEqual('GET');
      expect(request.request.url).toEqual(configUrlValue);

      tick(1000);
      // No request should have been made
      httpTestingController.verify();
    }).toThrowError('Config url is empty');
    // clear task, so that the interval is not called again
    service.clearTask();
  }));

  it('should handle not being able to retrieve config', fakeAsync(() => {
    prepareService(service);

    const request: TestRequest =
      httpTestingController.expectOne(configUrlValue);
    expect(() => {
      request.flush(
        {},
        { status: HttpStatusCode.BadGateway, statusText: 'Bad Gateway' },
      );

      expect(request.request.method).toEqual('GET');
      expect(request.request.url).toEqual(configUrlValue);

      tick(1000);
      // No request should have been made
      httpTestingController.verify();
    }).toThrowError('Could not get config');
    // clear task, so that the interval is not called again
    service.clearTask();
  }));
});
