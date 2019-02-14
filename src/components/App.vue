<template>
  <div id="app" class="container-fluid">
    <div class="row">
      <div class="col-sm-3">
        候補リスト
        <ul>
          <li v-for="candidate in candidates">
            <a v-on:click="selectItem" :data-item-name="candidate.item.name" href="#">{{ candidate.item.name }} ({{ candidate.item.price }})</a>
          </li>
        </ul>
      </div>
      <div class="col-sm-9">
        <div class="row">
          <div class="col-sm">
            選択した商品
            <ul>
              <li v-for="selected in selectedItems">
                <form>
                  <div class="form-group row">
                    <label for="staticEmail" class="col-sm-4 col-form-label">
                      <a v-on:click="unselectItem" href="#" :data-item-name="selected.item.name">[x]</a>
                      {{ selected.item.name }}
                    </label>
                    <div class="col-sm-2">
                      <div class="input-group input-group-sm">
                        <input type="text" v-model="selected.required" class="form-control">
                        <div class="input-group-append">
                          <button class="btn btn-outline-secondary" type="button" :data-item-name="selected.item.name" v-on:click="addRequired">+</button>
                          <button class="btn btn-outline-secondary" type="button" :data-item-name="selected.item.name" v-on:click="removeRequired">-</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
              </li>
            </ul>
          </div>
        </div>
        <div class="row">
          <div class="col-sm">
            計算結果(Total cost: {{ totalCost }})
          </div>
        </div>
        <div class="row">
          <div class="col-sm">
            必要な調合アイテム
            Required Items
            <li v-for="item in calculatedItems">
              {{ item.name }} ({{ item.required }})
            </li>
          </div>
          <div class="col-sm">
            採取/栽培が必要なもの
            <li v-for="ingredient in calculatedIngredients">
              {{ ingredient.name }} ({{ ingredient.required }})
            </li>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import items from '../js/data/items'

const findTarget = (list, el) => {
  const targetName = el.currentTarget.getAttribute('data-item-name')
  return list.find(e => e.item.name === targetName)
}

const calculate = (items, targetItemStates) => {
  const result = {}
  const itemsWithMap = items.reduce((acc, item) => {
    acc[item.name] = item
    return acc
  }, {})

  const queue = targetItemStates.map(i => ({ name: i.item.name, cost: i.item.cost, required: i.required }))
  while (true) {
    if (queue.length === 0) { break }
    const item = queue.pop()
    if (itemsWithMap[item.name]) {
      itemsWithMap[item.name].ingredients.forEach(ingredient => {
        queue.push({
          name: ingredient.name,
          required: ingredient.required * item.required,
        })
      })
    }

    if (result[item.name]) {
      result[item.name] += item.required
    } else {
      result[item.name] = item.required
    }
  }
  const keys = Object.keys(result)
	keys.sort()
  const targetItemNames = targetItemStates.map(is => is.item.name)
  const requiredItems = keys.filter(name => !!itemsWithMap[name] && !targetItemNames.includes(name)).map(key => ({ name: key, required: result[key] }))
  const totalCost = keys.filter(name => !!itemsWithMap[name]).reduce((acc, key) => itemsWithMap[key].cost * result[key] + acc, 0)
  const requiredIngredients = keys.filter(name => !itemsWithMap[name]).map(key => ({ name: key, required: result[key] }))
  return {
    requiredItems: requiredItems,
    requiredIngredients: requiredIngredients,
    totalCost: totalCost,
  }
}

export default {
  name: 'app',
  data () {
    items.sort(function(a, b) { return b.price - a.price })
    const itemsWithState = items.map(item => ({ item: item, selected: false, required: 1 }))
    return {
      itemsWithState: itemsWithState,
      items: items,
    }
  },
  methods: {
    selectItem: function (e) {
      const target = findTarget(this.itemsWithState, e)
      target.selected = true
    },
    unselectItem: function (e) {
      const target = findTarget(this.itemsWithState, e)
      target.selected = false
    },
    addRequired: function (e) {
      const target = findTarget(this.itemsWithState, e)
      target.required += 1
    },
    removeRequired: function (e) {
      const target = findTarget(this.itemsWithState, e)
      target.required -= 1
    },
  },
  computed: {
    candidates: function () {
      return this.itemsWithState.filter(i => i.selected === false)
    },
    selectedItems: function () {
      return this.itemsWithState.filter(i => i.selected === true)
    },
    totalCost: function () {
      return this.calculateResult.totalCost
    },
    calculateResult: function () {
      return calculate(this.items, this.selectedItems)
    },
    calculatedIngredients: function () {
      return this.calculateResult.requiredIngredients
    },
    calculatedItems: function () {
      return this.calculateResult.requiredItems
    },
  }
}
</script>

<style lang="css">
</style>
