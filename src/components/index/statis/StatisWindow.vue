<template>
    <div :style="{'height':fullWindowPx }">
      <div :style="{'height':halfClientHeight }">
        <Table  :columns="columns1" :data="data2">
        </Table>
        <Upload action="//jsonplaceholder.typicode.com/posts/">
          <Button  type="primary" icon="ios-cloud-upload-outline">上传分类数据</Button>
        </Upload>
      </div>
      <div :style="{'height':halfClientHeight }">
        <Table  :columns="columns1" :data="data2">
        </Table>
        <Upload action="//jsonplaceholder.typicode.com/posts/">
          <Button  type="primary" icon="ios-cloud-upload-outline">导出数据</Button>
        </Upload>
      </div>
    </div>
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
      return clientHeight
    },
    halfClientHeight: function () {
      return this.getClientHeight / 2 + 'px'
    },
    fullWindowPx: function () {
      return this.getClientHeight + 'px'
    }
  },
  data () {
    return {
      columns1: [
      ],
      data2: [
      ]
    }
  }
}
</script>

<style scoped>

</style>
