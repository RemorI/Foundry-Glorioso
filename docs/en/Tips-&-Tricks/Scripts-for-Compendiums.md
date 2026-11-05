## Execute Macro from Compendium

This Script here executes a Macro inside a Compendium with the UUID
`Compendium.custom-system-builder-shadowrun-6-compendium.macros.Macro.mU3qeB58kui3tvtq`. This is especially useful for
Macros, which are executed by Label Roll Messages and you don't want the Players to change the content of the Macro.

```js
const documentUuid = 'Compendium.custom-system-builder-shadowrun-6-compendium.macros.Macro.mU3qeB58kui3tvtq';

return await (await fromUuid(documentUuid)).execute({ entity });
```

## 2. Reload all entities within a Compendium

```js
const packId = 'compendium.actors'; // check the pack-id with 'game.packs' in the console

const documents = await game.packs.get(packId).getDocuments();
const filteredDocuments = documents.filter((document) => !document.isTemplate);

for (let i = 0; i < filteredDocuments.length; i++) {
  SceneNavigation.displayProgressBar({
    label: `${i + 1} / ${filteredDocuments.length + 1}`,
    pct: Math.round((i * 100) / filteredDocuments.length)
  });

  await filteredDocuments[i].templateSystem.reloadTemplate();
}

SceneNavigation.displayProgressBar({
  label: 'finished',
  pct: 100
});
```
