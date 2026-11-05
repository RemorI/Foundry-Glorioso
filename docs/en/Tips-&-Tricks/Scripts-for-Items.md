## Scripts for fetching values of specific Items in an Actor

All Items in an Actor are stored in the `Actor#items`-Collection. In there you can search the Item you're interested in
and return the corresponding result. Use
[find()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find) if you're looking
for 1 Item or [filter()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter)
for multiple ones.

**Fetching 1 value:**

```js
const itemName = 'myItem';
return entity.items.find((item) => item.name === itemName)?.system.props.durability ?? 'Item not found';
```

**Fetching multiple values and combining them with
[reduce()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce):**

```js
const itemTemplateName = '_Spell';
const itemTemplateId = game.items.getName(itemTemplateName).id;
return entity.items
  .filter((item) => item.system.template === itemTemplateId)
  .map((item) => item.system.props.charges)
  .reduce((acc, charges) => acc + charges);
```

## Script for updating multiple Items

The script works when used on a Character Sheet. Insert it into a Script-Expression and it will grab all Items by filter.
In this case it will filter the items in the current actor by the used Item Template (in this case `_Weapon`).
All Items, which pass the filter, will be updated. In this case, we reduce the `durability` in the Items by one (capped
at 0) and update the Items with the new value.

```js
const itemTemplateName = '_Weapon';
const itemTemplateId = game.items.getName(itemTemplateName).id;
entity.items
  .filter((item) => item.system.template === itemTemplateId)
  .forEach((item) => {
    const newDurability = Math.max(item.system.props.durability - 1, 0);
    item.update({ 'system.props.durability': newDurability });
  });
```

Authors: [Mechanized](https://gitlab.com/Mechanized82) & [Martin1522](https://gitlab.com/martin1522)
