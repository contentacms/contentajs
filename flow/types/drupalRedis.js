// @flow

export type CacheEntry = {
  expire: number,
  cid: string,
  creater: number,
  data: string,
  checksum: string,
  serialized: number,
  tags: string,
  valid: number,
};
