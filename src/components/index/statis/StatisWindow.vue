<template>
    <div :style="{'height':fullWindowPx }">
      <div class="leftsider" :class={active:isActiveStatis} >
        <Upload action="//jsonplaceholder.typicode.com/posts/">
          <Button  type="primary" icon="ios-cloud-upload-outline">上传分类数据</Button>
        </Upload>
        <Upload action="//jsonplaceholder.typicode.com/posts/">
          <Button  type="primary" icon="ios-cloud-upload-outline">导出数据</Button>
        </Upload>
      </div>
      <div :style="{'height':halfClientHeight }">
        <Table  :columns="columns1" :data="data2">
        </Table>

      </div>
      <div :style="{'height':halfClientHeight }">
        <Table  :columns="columns1" :data="data2">
        </Table>

      </div>
    </div>
</template>

<script>
export default {
  props: ['isActiveStatis'],
  name: 'StatisWindow',
  computed: {
    getClientHeight: function () {
      let clientHeight = document.documentElement.clientHeight
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
  .leftsider{
    width: 230px;
    height: 100%;
    background: #E0E0E0;
    float: left;
    border:2px solid palegreen;
  }
  .leftsider.active{
    width: 0px;
    margin-left: -50px;
  }
</style>
