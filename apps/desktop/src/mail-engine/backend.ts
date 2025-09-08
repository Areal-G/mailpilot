import {
  createRoutedBackendAdapter,
  type MailHttpRequestFn,
} from "@mailpilot/mail-core/protocol/routed-backend-adapter";

export function createRoutedBackendPorts(request: MailHttpRequestFn) {
  return createRoutedBackendAdapter({ requestFor: () => request });
}
