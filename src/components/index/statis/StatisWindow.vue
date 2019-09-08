<template>
    <div :style="{'height':getClientHeight}">统计分析</div>
</template>

<script>
export default {
  name: 'StatisWindow',
  computed: {
    getClientHeight: function () {
      // 屏幕可视区域的高度
      let clientHeight = document.documentElement.clientHeight
      // 窗口可视区域发生变化的时候执行
      window.onresize = () => {
        clientHeight = document.documentElement.clientHeight
        return clientHeight
      }
      clientHeight = clientHeight - 100
      return clientHeight + 'px'
    }
  }
}
</script>

<style scoped>

</style>
