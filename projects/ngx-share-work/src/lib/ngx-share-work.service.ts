import { Inject, Injectable, OnDestroy, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Config } from './types';

@Injectable({
  providedIn: 'root',
})
export class NgxShareWorkService implements OnInit, OnDestroy {
  /**
   * Injection token for the config url.
   */
  public static readonly CONFIG_URL: string = 'configUrl';

  /**
   * Interval id for the task.
   * @private
   */
  private intervalId?: ReturnType<typeof setInterval>;

  /**
   * Constructor.
   * @param configUrl
   * @param http
   */
  constructor(
    @Inject(NgxShareWorkService.CONFIG_URL) private configUrl: string,
    private http: HttpClient,
  ) {}

  /**
   * OnInit. Calls the config url and initializes the config.
   */
  public ngOnInit(): void {
    this.http.get(this.configUrl).subscribe({
      next: (v) => {
        if (this.verifyConfig(v)) {
          this.initConfig(v);
        }
      },
      error: () => {
        throw new Error('Could not get config');
      },
    });
  }

  /**
   * OnDestroy. Clears the task.
   */
  public ngOnDestroy(): void {
    this.clearTask();
  }

  /**
   * Clears the task.
   */
  public clearTask() {
    clearInterval(this.intervalId);
  }

  /**
   * Initializes the config.
   * Calls the url of the config every schedule.
   * @param v
   * @private
   */
  private initConfig(v: Config) {
    if (this.intervalId) this.clearTask();
    this.intervalId = setInterval(() => {
      this.http.get<string>(v.url).subscribe();
    }, v.schedule);
  }

  private verifyConfig(v: any): v is Config {
    if (!v) throw new Error('Config is empty');
    if (!v.url) throw new Error('Config url is empty');
    if (!v.schedule) throw new Error('Config schedule is empty');
    if (!v.type) throw new Error('Config type');
    return true;
  }
}
