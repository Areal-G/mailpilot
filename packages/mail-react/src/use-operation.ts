import { useCallback } from "react";
import type { OperationKey } from "@mailpilot/mail-core/identities";
import type { OperationState } from "@mailpilot/mail-core/operations";
import type { QuerySnapshot } from "@mailpilot/mail-core/queries";
import { useMailClient } from "./MailEngineProvider";
import { useQuerySnapshot } from "./use-query-snapshot";

export function useOperation(key: OperationKey): QuerySnapshot<OperationState> {
  const client = useMailClient();
  const { accountId, operationId } = key;
  const createHandle = useCallback(
    () => client.observeOperation({ accountId, operationId }),
    [client, accountId, operationId],
  );
  return useQuerySnapshot(createHandle);
}
