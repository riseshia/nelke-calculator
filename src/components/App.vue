<template>
  <div id="app" class="container-fluid">
    <div class="row">
      <div class="col-sm-3">
        Candidate List
        <ul>
          <li v-for="candidate in candidates">
            <a v-on:click="selectItem" :data-item-name="candidate.item.name" href="#">{{ candidate.item.name }}</a>
          </li>
        </ul>
      </div>
      <div class="col-sm-9">
        <div class="row">
          <div class="col-sm">
            Selected List
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
            Calculated List(Total cost: {{ totalCost }})
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

  const queue = targetItemStates.map(i => ({ name: i.item.name, required: i.required }))
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
    } else {
      if (result[item.name]) {
        result[item.name] += item.required
      } else {
        result[item.name] = item.required
      }
    }
  }
  const keys = Object.keys(result)
	keys.sort()
	return keys.map(key => ({ name: key, required: result[key] }))
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
      const reducer = (acc, i) => (i.item.cost * i.required + acc)
      return this.selectedItems.reduce(reducer, 0)
    },
    calculatedIngredients: function () {
      return calculate(this.items, this.selectedItems)
    },
  }
}
</script>

<style lang="css">
</style>
