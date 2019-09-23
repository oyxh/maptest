<template>
  <div>
    <promp-window @sendName ="addLayer" ></promp-window>
    <br>
    <Drawer title="选择区域" placement="left" :closable="false"  width="200px" v-model="value2" @on-close="drawerClose">
      <Tree :data="data2" ref="tree" ></Tree>
    </Drawer>
    <Modal
      v-model="modal1"
      title="是否继续"
      @on-ok="continueDraw"
      @on-cancel="endDraw"
      :closable="false">
      <p>是否继续为本单位添加区域，如本单位有多个区域请继续绘制？</p>
      <p>继续选确认</p>
      <p>否则取消</p>
    </Modal>
    <div v-for="(layer,index) in this.layersget" :key="layer.layerId"  :style= "{height:'100%',display:'inline-block',marginBottom:'5px',border: index === activeLayer ? '2px solid blue' : '2px solid #66b3FF'}"
         @click=selectLayer($event,layer,index) >
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
        <button type="success" class ="buttonRight" @click="drawLayer" >图层绘制</button>
      </div>
      <div>
        <button type="success" class ="buttonLeft" >导入数据</button>
        <button type="success" class ="buttonRight">清除图层</button>

        <button type="success" class ="buttonRight" @click=saveLayer($event,layer.layerId,index)>保存图层</button>

      </div>
    </div>
  </div>
</template>

<script>
/* eslint-disable no-unused-vars,eqeqeq,no-undef */
import PrompWindow from './promp'
import Mask from '../../../utils/Mask'
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
      geometrys: [], // 所有覆盖几何物体 来自数据库的数据
      plyzones: [], // 实体区域，每个区域包括一个或几个多边形区域
      geometrysInLayer: { },
      data2: [],
      drawTool: null,
      importData: false,
      mask: null,
      isStartDraw: true,
      modal1: false // 是否继续本区域的对话框
      // layerChange: this.layerChangeFromFather
    }
  },
  created () {
    this.overlayMap = new Map()
  },
  mounted () {
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
      var that = this
      this.mask = new Mask(this.map, this.geometrys, this.geometrysInLayer, this.overlayMap, this)
      var postconfig = {
        method: 'get',
        url: 'api/layerlist'
      }
      var postconfig1 = {
        method: 'get',
        url: 'api/geometrylist'
      }
      this.axiosRequest(postconfig).then(
        res => {
          that.layersget = res.data
          that.initPage()
          console.log(res)
        }
      ).catch(
        error => {
          console.log(error)
        }
      )
      /*      this.axios.all([that.axiosRequest(postconfig), that.axiosRequest(postconfig1)])
        .then(this.axios.spread(function (acct, perms) {
          that.layersget = acct.data
          that.geometrys = perms.data
          console.log(that.layersget)
          console.log(that.geometrys)
          that.mask = new Mask(that.map, that.geometrys, that.geometrysInLayer, that.overlayMap, that)
          // that.initOverlays()// 初始化图层
        })).catch(error => {
          console.log(error)
        }) */
    }
  },
  methods: {
    initPage: function () {
      for (var layer of this.layersget) {
        this.mask.addBackground(layer)
      }
      this.mask.setFocus(this.layersget[0])
    },
    axiosRequest: function (postconfig) { // 删除多个gemetry，批量删除
      return this.axios(postconfig)
    },
    selectLayer (e, layer, index) { // 选择图层
      if (this.activeLayer !== index) {
        this.activeLayer = index
        this.mask.setFocus(layer)
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
      bdary.get(backcounty, function (rs) { // 获取行政区域
        // map.clearOverlays() // 清除地图覆盖物
        var count = rs.boundaries.length // 行政区域的点有多少个，行政区域的多边形可能有多个
        if (count === 0) {
          alert('未能获取当前输入行政区域')
        }
        layer.layerData = rs.boundaries
        me.mask.addBackground(layer)
        me.mask.setFocus(layer)
      })
    },
    saveLayer: function (e, layerId, index) { // 保存图层  layer为数据，是layerget数组中的单元
      var layer = this.layersget[this.activeLayer]
      var postconfig = {
        method: 'post',
        url: 'api/savelayer',
        dataType: 'json',
        data: layer,
        contentType: 'application/json'
      }
      this.axios(postconfig).then(res => { console.log(res) }).catch(error => { console.log(error) })
      /* console.log(this.overlayMap)
      var that = this
      var layer = this.layersget[this.activeLayer]
      var geometrys = this.geometrysInLayer[layerId] // 为map数据集合,key为geometyrId,value为geometry
      console.log(that.overlayMap)
      var deleteGeometrys = []
      var deleteGeometrysId = []
      var editGeometrys = []
      for (let index in geometrys) {
        if (that.overlayMap.get(geometrys[index])._exist == 0) { // this.overlayMap为map数据集合,key为geometry,value为MyOverlay
          deleteGeometrysId.push(geometrys[index].geometryId)
        } else if (that.overlayMap.get(geometrys[index])._isEdit) {
          editGeometrys.push(geometrys[index])
        }
      }
      this.axios.all([that.deleteGeometrys(deleteGeometrysId), that.editGeometrys(editGeometrys)])
        .then(this.axios.spread(function (acct, perms) {
          console.log(acct)
          console.log(perms)
          that.synchEdit(editGeometrys)
          that.synchDelete(deleteGeometrysId, geometrys)
          that.$Message.info('保存成功')
        })).catch(error => {
          that.$Message.info('保存未成功')
          console.log(error)
        }) */
    },
    drawLayer: function () {
      this.$parent.generateDrawTool()
      this.drawTool = this.$parent.drawTool
      this.drawTool.removeEventListener('add')
      this.drawTool.addEventListener('overlaycomplete', this.overlaycomplete, 'add')
    },
    overlaycomplete: function (e) {
      if (this.isStartDraw) { // 开始画第一个区域
        this.plyzones = []
      }
      this.plyzones.push(e.overlay)
      this.modal1 = true
    },
    continueDraw: function () {
      this.isStartDraw = false
    },
    endDraw: function () {
      this.isStartDraw = true
      this.addGridZone()
    },
    addGridZone: function () {
      var that = this
      var layer = this.layersget[this.activeLayer]
      var gridPoly = {
        polygonName: '',
        polygonMana: '',
        polygonData: [] //  存储区域内的多边形区域
      }
      gridPoly.polygonData = this.plyzones.slice(0)// this.polyPathToJson(e.overlay.getPath())
      this.$Modal.confirm({
        title: '请输入网格信息：',
        render: (h) => {
          const inputData = [{
            domProps: {
              value: gridPoly.polygonName,
              autofocus: true,
              placeholder: '请输入网格名字...',
              style: 'color:red;width:100%;margin-bottom:8px'
            },
            on: {
              input: (val) => {
                gridPoly.polygonName = val.target.value
              }
            }
          },
          {
            domProps: {
              value: gridPoly.polygonMana,
              autofocus: true,
              placeholder: '请输入网格负责人...',
              style: 'color:red;width:100%'
            },
            on: {
              input: (val) => {
                gridPoly.polygonMana = val.target.value
              }
            }
          }
          ]
          return h('div', inputData.map(item => h('input', item)))
        },
        onOk: function () {
          console.log(gridPoly.polygonData)
          that.mask.addGridZone(layer, gridPoly)
          /*          layer.layerData.push(gridPoly)
          var polygonObject = new MyOverlay(map, gridPoly, layer.layerData, this, false, e.overlay)
          this.overlayMap.set(gridPoly, polygonObject) */
        },
        onCancel: function () {
          for (var overlay of gridPoly.polygonData) {
            that.map.removeOverlay(overlay)
          }
        }
      })
      console.log(gridPoly.polygonData)
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
