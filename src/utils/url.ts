const SAFE_RELATIVE_PATTERN = /^(#|\/|\.\/|\.\.\/|[^\s:?#]+(?:\/[^\s?#]*)?(?:\?[^\s#]*)?(?:#.*)?)$/;

export function isRelativeUrl(value: string): boolean {
  return SAFE_RELATIVE_PATTERN.test(value) && !value.includes("://");
}

export function hasProtocol(value: string, protocols: string[]): boolean {
  return protocols.some((protocol) => value.toLowerCase().startsWith(`${protocol}:`));
}

export function isHttpUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}
