# Installing Bileog on another Mac

The build is `dist/Bileog-0.1.0-arm64.dmg` (~106 MB). It targets **Apple Silicon
Macs** (M1 and newer).

## Steps

1. Copy the `.dmg` to the other Mac (AirDrop, USB stick, cloud drive - anything).
2. Double-click the `.dmg`, then drag **Bileog** onto the **Applications** folder.
3. Eject the disk image.
4. **Clear the quarantine flag** - open Terminal and run:

   ```sh
   xattr -dr com.apple.quarantine /Applications/Bileog.app
   ```

5. Launch Bileog from Applications. Step 4 is a one-time thing.

## Why step 4 is needed

The app is **ad-hoc signed** but **not notarized**. Notarization requires an
Apple **Developer ID Application** certificate, which comes with the paid Apple
Developer Program ($99/yr). The only signing certificate on the build machine is
an *Apple Development* one, which is for local development and provisioned test
devices - it cannot authorize an app to run on an arbitrary Mac.

Without step 4, macOS shows **"Bileog is damaged and can't be opened"** - this is
Gatekeeper's message for a quarantined app it can't verify, not an actual
corrupted download.

Right-click → Open does **not** work around this on recent macOS versions for
non-notarized apps; the `xattr` command is the reliable route. Alternatively,
after the first blocked launch, go to **System Settings → Privacy & Security**
and click **Open Anyway**.

If you'd rather avoid the extra step for future builds, enroll in the Apple
Developer Program and add to `electron-builder.yml`:

```yaml
mac:
  identity: 'Developer ID Application: Your Name (TEAMID)'
  hardenedRuntime: true
  notarize:
    teamId: TEAMID
```

…with `APPLE_ID` and `APPLE_APP_SPECIFIC_PASSWORD` set in the environment. Then
the app installs with no warnings at all.

## Where the data lives

Stories, drafts, and the SQLite database are stored per-user at:

```
~/Library/Application Support/bileog/
```

This is outside the app bundle, so it survives app updates. It also means the
other Mac starts with an empty library - to migrate existing stories, copy that
whole folder across while Bileog is closed on both machines.

## Rebuilding

```sh
npm run dist       # typecheck, build, and package the DMG into dist/
npm run dist:dir   # faster: unpacked .app only, no DMG (for testing)
```

To build for Intel Macs instead, swap `--arm64` for `--x64` in the `dist`
script, or use `--universal` for a binary that runs on both (roughly double the
size).
