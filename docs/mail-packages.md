# Shared mail packages

`@mailpilot/mail-core`, `@mailpilot/mail-sqlite`, and `@mailpilot/mail-react`
are the mailbox engine used by web and desktop. `@mailpilot/mail-ui` is the
React DOM presentation and stays in this app. The Expo adapter stays in the
mobile app.

Web and desktop pass `HostRuntime` into the store and the engine. Attachments
are added to the provider's mailbox draft as they are attached, and a send
with files goes out from that draft, so the engine never holds their bytes.
The queued send is watched with `observeOperation`.

## Release

A push to `main` that changes `packages/mail-core`, `packages/mail-sqlite`,
or `packages/mail-react` publishes those packages to npm. They share one
version. The workflow builds each package and publishes its `dist` manifest,
core then sqlite then react, and skips a version that is already on npm.
Bump the version in every package that changed, and in the packages that
depend on it, before merging. Mobile depends on the published versions.

1. `pnpm -F @mailpilot/mail-core -F @mailpilot/mail-sqlite -F @mailpilot/mail-react run build`
2. `pnpm -F @mailpilot/mail-core pack:smoke`
3. Dist manifests rewrite `workspace:*` to that version and set `publishConfig.access` to `public`.

Do not import `@mailpilot/mail-sqlite/node` from a non-Node host. That entry
point uses Node file APIs.
