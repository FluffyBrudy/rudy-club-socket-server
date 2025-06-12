export type Payload = {
  username: string;
  id: string;
  iat: typeof Date.now;
  exp: typeof Date.now;
};
