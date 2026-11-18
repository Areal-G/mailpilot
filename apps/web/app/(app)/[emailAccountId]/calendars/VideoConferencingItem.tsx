"use client";

import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import { Switch } from "@/components/ui/switch";

// Video links come from the destination calendar's provider (Google Meet or
// Microsoft Teams), so the switch is off and locked when that calendar has no
// video option.
export function VideoConferencingItem({
  canAddVideo,
  videoEnabled,
  videoLabel,
  onChange,
}: {
  canAddVideo: boolean;
  videoEnabled: boolean;
  videoLabel: string | null;
  onChange: (enabled: boolean) => void;
}) {
  return (
    <Item variant="outline">
      <ItemContent>
        <ItemTitle>Video conferencing</ItemTitle>
        <ItemDescription>
          {canAddVideo && videoLabel
            ? `Add a ${videoLabel} link to each booking.`
            : "The selected calendar can't add video links."}
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        <Switch
          checked={canAddVideo && videoEnabled}
          disabled={!canAddVideo}
          onCheckedChange={onChange}
          aria-label="Add video conferencing"
        />
      </ItemActions>
    </Item>
  );
}
