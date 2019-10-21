<template>
  <div class="simple-graph">
    <svg
      class="render"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <path
        class="path"
        :d="path"
      />
    </svg>
  </div>
</template>

<script>
import {
  scaleLinear,
  extent,
} from 'd3'

export default {
  props: {
    points: {
      type: Array,
      required: true,
    },
  },

  computed: {
    values () {
      return this.points.map(pt => pt.value)
    },

    scale () {
      return scaleLinear()
        .domain(extent([0].concat(this.values)))
        .range([0, 100])
    },

    path () {
      let path = ''
      const scale = this.scale
      const points = this.points
      let index = 0
      const l = points.length
      for (const point of points) {
        const operator = path ? 'L' : 'M'
        const position = `${index / l * 100},${100 - scale(point.value)}`
        path += `${operator}${position}`
        index++
      }
      return path
    },
  },
}
</script>

<style lang="stylus" scoped>
@import '~@vue/cli-ui/src/style/imports'

.simple-graph
  position relative

.render
  position absolute
  top 0
  left 0
  width 100%
  height 100%

.path
  stroke $vue-ui-color-accent
  stroke-width 1px
  fill none
  vector-effect non-scaling-stroke
  .vue-ui-dark-mode &
    stroke lighten(@stroke, 60%)
</style>
