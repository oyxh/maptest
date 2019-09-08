<template>
  <div class="mapcontent" >
    <div class="leftsider" :class={active:isActive} >
    </div>
    <div id ="allmap" class = "allmapstyle" :class={active:isActive} :style="{'height':getClientHeight}">
      <div id="map" ></div>
    </div>
  </div>
</template>

<script>
/* eslint-disable no-undef */
export default {
  props: ['isActive'],
  name: 'MapWindow',
  data () {
    return {
      map: null
    }
  },
  created () {
  },
  mounted: function () {
    this.init().then((BMap) => {
      this.loadScript()('../../../static/js/bmap/polygon.js', () => {
      }).then(res => {
        return res('../../../static/js/bmap/drawingManager.js', () => {
          this.initMap()
        })
      })
    })
  },
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
  },
  methods: {
    init: function () {
      // console.log("初始化百度地图脚本...");
      const AK = 'EPgo3ahLed1MOQlZDPg1fdl0DN7Pg07w'
      const BMapURL = 'https://api.map.baidu.com/api?v=2.0&ak=' + AK + '&s=1&callback=onBMapCallback'
      return new Promise((resolve, reject) => {
        // 如果已加载直接返回
        if (typeof BMap !== 'undefined') {
          resolve(BMap)
          return true
        }
        // 百度地图异步加载回调处理
        window.onBMapCallback = function () {
          console.log('百度地图脚本初始化成功...')
          resolve(BMap)
        }
        // 插入script脚本
        let scriptNode = document.createElement('script')
        scriptNode.setAttribute('type', 'text/javascript')
        scriptNode.setAttribute('src', BMapURL)
        document.body.appendChild(scriptNode)
      })
    },
    initMap () {
      var map = new window.BMap.Map('allmap', {enableMapClick: false})
      this.map = map
      map.centerAndZoom(new window.BMap.Point(116.404, 39.915), 16) // 初始化地图,设置中心点坐标和地图级别
      // 添加地图类型控件
      map.addControl(new window.BMap.MapTypeControl({
        mapTypes: [
          BMAP_NORMAL_MAP,
          BMAP_HYBRID_MAP
        ]}))
      // 添加到地图当中
      map.setCurrentCity('北京') // 设置地图显示的城市 此项是必须设置的
      map.enableScrollWheelZoom(true) // 开启鼠标滚轮缩放
      this.layerChange = !this.layerChange // 子组件按数据生成覆盖物
    },
    loadScript: function () {
      return function _loadScript (url, callBack) {
        return new Promise(function (resolve) {
          let script = document.createElement('script')
          script.setAttribute('type', 'text/javascript')
          if (script.readyState) {
            // 兼容IE的script加载事件
            script.onreadystatechange = function () {
              // loaded ： 下载完毕 complete： 数据准备完毕。这两个状态ie可能同时出现或者只出现一个
              if (script.readyState === 'loaded' || script.readyState === 'complete') {
                // 防止加载两次
                script.onreadystatechange = null
                callBack()
                // 把函数传递下去，保证能顺序加载js
                resolve(_loadScript)
              }
            }
          } else {
            script.onload = function () {
              callBack()
              resolve(_loadScript)
            }
          }
          script.src = url
          document.head.appendChild(script)
        })
      }
    }
  }
}
</script>

<style scoped>
  .allmapstyle{
    margin:3px 0 0;
    margin-left: 233px;
  }
  .allmapstyle.active {
    margin-left: 0px;
  }
  .leftsider{
    width: 230px;
    height: 100%;
    background: #ffffff;
    float: left;
  }
  .leftsider.active{
    width: 0px;
  }
  .mapcontent{
  }
</style>
