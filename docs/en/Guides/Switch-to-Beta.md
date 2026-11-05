If you wish to switch to the Beta version, follow these steps :

> &#x26a0;&#xfe0f; **BACKUP YOUR DATA FOLDER**
>
> This operation can corrupt your world and force you to redo everything.
>
> CSB can't guarantee a smooth transition, as some steps need direct edition of foundry configuration files. We decline all reponsibility for the loss of a world if you do not backup the Folder.

## 0. Before you begin

### Beta & Unstable version downsides

Beta and Unstable versions are not stable. They are in developing process, and while not much should change between the beta version and the future stable, there can be some breaking changes between two beta versions.

Unstable is really unstable. I highly discourage using it for real games, but you can use it to discover in advance the future features.

### Revert to stable

Reverting to stable from beta or unstable is not supported. The best way to do it is to wait for the next stable release, and migrating then. Going back before a stable release can break your world in case of data-migration in a version. As usual, please backup your data before attempting migration.

## 1. Download the new version of Custom System Builder

First, you need to install the version you want to switch to.

### Stable version

The stable version is available in Foundry's System explorer. Alternatively, you can download it with this manifest link :

```url
https://gitlab.com/custom-system-builder/custom-system-builder/-/raw/main/system.json
```

### Beta version

The beta version is a preview, kinda stable version of CSB. It contains the latest features & bugfixes, while being correctly tested and stable. It can still contain bugs, it is a work-in-progress version. It must be installed with the manifest link. Only the latest Beta version is available, there is no way to download a previous beta. You can download it with this manifest link :

```url
https://gitlab.com/api/v4/projects/31995966/jobs/artifacts/beta/raw/out/system.json?job=build-beta
```

### Unstable version

The unstable version is the current developing version. It contains the latest features, fresh out of development. It is almost certainly buggy, and should only be used by the most adventurous. It must be installed with the manifest link. Only the latest Unstable version is available. You can download it with this manifest link :

```url
https://gitlab.com/api/v4/projects/31995966/jobs/artifacts/develop/raw/out/system.json?job=build-unstable
```

## 2. Change your world's system

Quit the world on Foundry (Return to Setup). Get the version of the system you wish to switch to.

In the Foundry Data folder, open the world.json in your world folder. Edit the `system` and `systemVersion` keys with the new system ID and new system version.

| CSB Version | System Key                     |
| ----------- | ------------------------------ |
| Stable      | custom-system-builder          |
| Beta        | custom-system-builder-beta     |
| Unstable    | custom-system-builder-unstable |

## 3. Restart Foundry and load your World

Restart Foundry. On the World selection page, your world should have the new system ID displayed.

When loading your world, a pop-up window will appear, asking you to migrate settings & flags. It is recommended to migrate them, as they are important for the system's inner workings.

Your world is now migrated, congratulations !
