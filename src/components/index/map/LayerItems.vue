<template>
  <div>
    <promp-window @sendName ="addLayer" ></promp-window>
    <br>
    <Drawer title="选择区域" placement="left" :closable="false"  width="200px" v-model="value2" @on-close="drawerClose">
      <Tree :data="data2" ref="tree" ></Tree>
    </Drawer>
    <div v-for="(layer,index) in this.layersget" :key="layer.layerId"  :style= "{height:'100%',display:'inline-block',marginBottom:'5px',border: index === activeLayer ? '2px solid blue' : '2px solid #66b3FF'}"
         @click=selectLayer($event,layer.layerId,index) >
      <div class="layerstyle">
        <label>图层名称:{{layer.layerName}}- {{ index }}</label>
        <label >
          关闭编辑
        </label>
        <input  type="checkbox" value="checked" >
        <button type="success"  class="closeButton" @click=deleteLayer($event,layer.layerId,index)>&times;</button><br>
        <label>图层背景:{{layer.layerGround}}</label>
      </div>
      <div>
        <button type="success" class ="buttonLeft"  @click="value2 = true" >选择区域</button>
        <button type="success" class ="buttonRight" >隐藏图层</button>
        <button type="success" class ="buttonRight" >图层绘制</button>
      </div>
      <div>
        <button type="success" class ="buttonLeft" >导入数据</button>
        <button type="success" class ="buttonRight">清除图层</button>

        <button type="success" class ="buttonRight" >保存图层</button>

      </div>
    </div>
  </div>
</template>

<script>
/* eslint-disable no-unused-vars,eqeqeq */
import PrompWindow from './promp'
export default {
  name: 'LayerItems',
  components: {PrompWindow},
  props: ['map', 'layerChangeFromFather'],
  computed: {
    layerChange: function () {
      // return this.layerChangeFromFather
      return this.$store.getters.layerRefresh
    }
  },
  /*
geometrys 数组，从数据库获取，该user的所有几何体的数据库存储信息
geometrysInLayer:所有几何体重新存储为，geometrysInLayer[layerId]为一个map，图层id为layerId的所有几何体都存储在此，geometrysInLayer[layerId].set(geometryId,geometry),将geometrys中的单位映射至该数据
页面所有操作都对geometrysInLayer进行
*/
  data: function () {
    return {
      activeLayer: 0,
      overlayMap: null,
      value2: false,
      layersget: [], // 所有图层
      geometrys: [], // 所有覆盖几何物体
      geometrysInLayer: { },
      data2: [],
      drawTool: null,
      importData: false,
      mask: null
      // layerChange: this.layerChangeFromFather
    }
  },
  created () {
    this.overlayMap = new Map()
  },
  mounted () {
    console.log('LayerItems is mounted')
    var that = this
    var postconfig = {
      method: 'get',
      url: 'api/districtlist'
    }
    this.axios(postconfig)
      .then(
        function (response) {
          that.data2 = response.data
        }
      )
      .catch(function (error) {
        console.log(error)
      })
    // this.layerIsChange()
  },
  watch: {
    layerChange: function () { // 同步获取数据库的图层信息
      console.log('layerChange')
      var that = this
      var postconfig = {
        method: 'get',
        url: 'api/layerlist'
      }
      var postconfig1 = {
        method: 'get',
        url: 'api/geometrylist'
      }
      this.axios.all([that.axiosRequest(postconfig), that.axiosRequest(postconfig1)])
        .then(this.axios.spread(function (acct, perms) {
          that.layersget = acct.data
          that.geometrys = perms.data
          console.log(that.layersget)
          console.log(that.geometrys)
          // that.initOverlays()// 初始化图层
        })).catch(error => {
          console.log(error)
        })
    }
  },
  methods: {
    axiosRequest (postconfig) { // 删除多个gemetry，批量删除
      return this.axios(postconfig)
    },
    selectLayer (e, layerId, index) { // 选择图层
      if (this.activeLayer !== index) {
        this.activeLayer = index
        // this.mask.setFocus(layerId)
      }
    },
    addLayer (gridName) {
      var that = this
      var postconfig = {
        method: 'post',
        url: 'api/addlayer',
        data: {
          layerName: gridName
        },
        transformRequest: [function (data) { // 登录时处理数据格式,处理后后台接收的参数为data按顺序传递
          let ret = ''
          for (let it in data) {
            ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
          }
          return ret
        }]
      }
      this.axios(postconfig)
        .then(
          function (response) {
            that.activeLayer = 0
            var layerId = response.data.msg
            that.addLayerInPage(gridName, layerId)
            // that.startDraw()
          })
        .catch(function (error) {
          console.log(error)
        }) // axios
    },
    addLayerInPage (gridName, layerId) { // 页面添加layer数据
      this.layersget.unshift({
        layerId: layerId,
        layerName: gridName
      })
      this.activeLayer = 0
      /*     console.log(this.mask)
      if (this.mask !== undefined) {
        this.mask.setFocus(layerId)
      } */
    },
    drawerClose: function () { // 选择背景地图的drawer关闭
      // console.log(this.activeLayer)
      // console.log(this.$refs.tree.getSelectedNodes()[0].title)
      if (this.$refs.tree.getSelectedNodes().length === 0) {
        this.$Message.info('没有选择背景图层')
      } else {
        var backcounty = this.$refs.tree.getSelectedNodes()[0].title
        if (backcounty !== this.layersget[this.activeLayer].layerGround) {
          var that = this
          this.layersget[this.activeLayer].layerGround = backcounty
          this.$Modal.confirm({
            title: '背景变化',
            content: '即将更改背景区域，请确定',
            onOk: function () {
              that.getBoundary(backcounty)
            }
          })
        }
      }
    },
    getBoundary: function (backcounty) {
      var map = this.$parent.map
      var bdary = new window.BMap.Boundary()
      var layer = this.layersget[this.activeLayer]
      var me = this
      console.log(bdary)
      bdary.get(backcounty, function (rs) { // 获取行政区域
        // map.clearOverlays() // 清除地图覆盖物
        var count = rs.boundaries.length // 行政区域的点有多少个，行政区域的多边形可能有多个
        if (count === 0) {
          alert('未能获取当前输入行政区域')
          return
        }
        var pointArray = []
        for (var i = 0; i < count; i++) {
          var ply = new window.BMap.Polygon(rs.boundaries[i], {strokeWeight: 2, strokeColor: '#ff0000', strokeOpacity: 0.8}) // 建立多边形覆盖物
          pointArray.push(ply.getPath())
        }
        if (layer.layerId !== undefined) {
          // me.mask.deleteOverlays(layer.layerId)
        }
        for (var j = 0; j < pointArray.length; j++) { // 简化行政区域的点
          var formatPolygon = { }
          formatPolygon.geometryName = backcounty
          formatPolygon.geometryClass = 'PLYGON'
          formatPolygon.layerId = layer.layerId
          formatPolygon.isBackground = 1
          var pointArrayJson = []
          for (var k = 0; k < pointArray[j].length; k++) {
            pointArrayJson.push({
              'lng': pointArray[j][k].lng,
              'lat': pointArray[j][k].lat
            })
          }
          formatPolygon.geometryData = pointArrayJson
          console.log(formatPolygon)
          me.mask.addOverlay(formatPolygon)
          // formatGroundData.push(formatPolygon)
          /*          var ply1 = new window.BMap.Polygon(pointArray[j], {strokeWeight: 2, strokeColor: '#ff0000', strokeOpacity: 0.8})
          ply1.setFillOpacity(0.1)
          map.addOverlay(ply1) */
        }
      })
    }
  }
}
</script>

<style scoped>
  .layerstyle{
    width:226px;
    display:inline-block;
    fontSize: 13px;
    height:38px;
    background:#D8D8D8;
    lineHeight:38px;
    /*  color:  #868E8E;
      textAlign:left;
      display:inline-block;*/
  }
  .buttonLeft{
    width:33.33%;
    float:left;
    border:2px solid #e3dbe2;
    background-color: #ffffff;
  }
  .buttonRight{
    width:33.33%;
    float:right;
    border:2px solid #e3dbe2;
    background-color: #ffffff;
  }
  .closeButton{
    float:right;
    height:16px;
    margin-right: 5px;
  }
  checkeButton{
    marginLeft:15px;
  }
</style>
