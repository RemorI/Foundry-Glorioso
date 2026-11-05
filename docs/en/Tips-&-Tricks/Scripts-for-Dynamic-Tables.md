## Definition of Dynamic Tables

For those, who are familiar with Typescript, Dynamic Tables have the following type definitions:

```ts
type Row = Record<string, Primitive>;
type PredefinedRow = Row & {
  $predefinedIdx: number;
  $deleted: boolean;
  $deletionDisabled: boolean;
};
type DynamicTable = Record<string, Row | PredefinedRow>;
```

Here an example of the structure:

```json
{
  "props": {
    "dynamicTable": {
      "0": {
        "$predefinedIdx": 1,
        "$deleted": false,
        "$deletionDisabled": true,
        "column1": "Fighting",
        "column2": 5
      },
      "1": {
        "$predefinedIdx": 0,
        "$deleted": true,
        "$deletionDisabled": false,
        "column1": "Flying",
        "column2": 0
      },
      "2": {
        "column1": "Skinning",
        "column2": 5
      },
      "3": {
        "column1": "Walking",
        "column2": 10
      }
    }
  }
}
```

When working with Dynamic Tables, you have to consider `PredefinedRow`. These are set from the corresponding `Template`
and cannot be removed from the User. Instead, a `$deleted`-flag is set, so you have to filter these out if you don't want
them in your results.

## Scripts for fetching values in a Dynamic Table

Dynamic Tables are stored in `props` and can be accessed like any other property. If you're only interested in a single
value, use [find()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find),
otherwise use [filter()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter)
if you might need multiple values (in an `Array` e.g.). Use
[Object.values()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/values) to get
rid of the incremental numbers, you won't need them in most cases.

**Fetching 1 value:**

```js
return Object.values(entity.system.props.dynamicTable)
  .find((row) => !row.$deleted && row.column1 === 'Skinning')
  .map((row) => row.column2);
```

**Fetching multiple values:**

```js
return Object.values(entity.system.props.dynamicTable)
  .filter((row) => !row.$deleted && row.column2 === 5)
  .map((row) => row.column1);
```

## Script for updating multiple rows in a Dynamic Table

This Script can be used to update all rows of a Dynamic Table. An example of where this is useful is if you have a
Dynamic Table, where each individual Skill/Item/Ability has a different number of uses per day that you want to track.

```js
const table = entity.system.props.Table;

Object.values(table)
  .filter((row) => !row.$deleted)
  .map((row) => ({
    ...row,
    uses: parseInt(row.uses) + 1
  }));

await entity.update({ 'system.props.Table': table });
```

Authors: [Mechanized](https://gitlab.com/Mechanized82) & [Martin1522](https://gitlab.com/martin1522)

## Script for merging non-predefined rows to predefined rows

This Script allows to merge non-predefined rows into predefined rows. Rows, which don't have a corresponding predefined
row, **will be deleted!** This is useful if you meet the following criteria:

- You have multiple Actors with basically the same Rows, for example all Actors posses the same skills
- You've added the rows, which are equal in all Actors, to the Template (predefined rows)
- You want to avoid having duplicates in your Table when you're reloading the Templates of your Actors after you've
  added the predefined rows **OR** you want to override data column-data with the column-data of predefined rows

The following fields should be changed:

- **templateName**: The name of the Template. This determines, which Actors will be updated
- **tableKey**: The key of the Table where you want to merge data
- **columnKey**: The column key which determines, which rows should be merged. This should be something like the unique `Name` of
  the Skills
- **columns**: This determines, which columns will be taken into consideration for merging. Columns, which are not
  specified, will be deleted and replaced with the values of the predefined row

**Warning: Perform a backup before you execute this Script, you might lose data!**

```js
const templateName = '_Template';
const tableKey = 'Skills';
const columnKey = 'Name';
const columns = ['Base', 'Bonus'];

const templateId = game.actors.getName(templateName).id;
const tablePath = `system.props.${tableKey}`;
const actors = game.actors.filter((actor) => !actor.isTemplate && actor.system.template === templateId);

for (let i = 0; i < actors.length; i++) {
  const entity = actors[i];

  logProgress(entity, i, actors.length);

  await migrateTableRows(entity);
}

finish();

async function migrateTableRows(entity) {
  const previousData = {};
  Object.values(foundry.utils.getProperty(entity, tablePath))
    .filter((row) => !row.deleted)
    .forEach((row) => {
      if (previousData[row[columnKey]] && row.predefinedIdx !== undefined) {
        previousData[row[columnKey]] = foundry.utils.mergeObject(row, previousData[row[columnKey]]);
      }

      if (row.predefinedIdx !== undefined) {
        previousData[row[columnKey]] = row;
      } else {
        columns.forEach((column) => (previousData[row[columnKey][column]] = row[column]));
      }
    });

  await entity.update({ [`system.props.-=${tableKey}`]: true });
  await entity.templateSystem.componentMap[tableKey]._synchronizePredefinedLines(entity.templateSystem);

  const newTable = {};
  Object.entries(foundry.utils.getProperty(entity, tablePath))
    .filter(([_, row]) => row.predefinedIdx !== undefined)
    .forEach(
      ([key, row]) =>
        (newTable[key] = {
          ...row,
          ...(previousData[row[tableKey]] ?? {})
        })
    );

  await entity.update({ [tablePath]: newTable });
}

function logProgress(document, current, total) {
  SceneNavigation.displayProgressBar({
    label: `CSB: Updating ${document.constructor.name} ${current + 1} / ${total}`,
    pct: Math.round((current * 100) / total)
  });
}

function finish() {
  SceneNavigation.displayProgressBar({
    label: 'CSB: Finished updating',
    pct: 100
  });
}
```
