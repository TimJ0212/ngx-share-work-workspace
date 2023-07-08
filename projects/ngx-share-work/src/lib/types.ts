export type Config = {
  type: Type;
  url: string;
  schedule: number;
};

export enum Type {
  Request = 'Request',
}
