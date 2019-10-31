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
        <button type="success"  class="closeButton" @click=deleteLayer($event,layer,index)>&times;</button><br>
        <label>图层背景:{{layer.layerDes}}</label>
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
      layersget: this.$store.getters.layersget, // 所有图层
      geometrys: [], // 所有覆盖几何物体 来自数据库的数据
      plyzones: [], // 实体区域，每个区域包括一个或几个多边形区域
      geometrysInLayer: this.$store.getters.geometrysInLayer,
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
          // that.layersget = acct.data
          for (var item of acct.data) {
            that.layersget.push(item)
          }
          that.geometrys = perms.data
          that.initPage()
        })).catch(error => {
          console.log(error)
        })
    }
  },
  methods: {
    initPage: function () {
      this.mask = new Mask(this.map, this.geometrysInLayer, this.overlayMap, this)
      for (let layer of this.layersget) {
        this.mask.addBackground(layer)
      }
      for (var gridPoly of this.geometrys) {
        if (gridPoly.isbackground == 'WGS84') {
          for (let pointString of gridPoly.geometryData) {
            this.covertToBaidu(pointString, gridPoly.geometryName)
          }
        }
        gridPoly.geometryData = new Set(gridPoly.geometryData.map(this.generateOverlay))
        this.mask.addGridZone(gridPoly)
      }
      for (let layer of this.layersget) { // 先隐藏所有
        this.mask.hideLayer(layer)
      }
      if (this.layersget[0] !== undefined) {
        this.mask.setFocus(this.layersget[0])
      }
    },
    covertToBaidu: function (pointString, name) {
      var that = this
      var result = []
      var resultString = ''
      var strs = [] // 定义一数组
    },
    generateOverlay: function (geometryData) {
      // console.log(geometryData)
      var ply = new window.BMap.Polygon(geometryData, {strokeWeight: 2, strokeColor: '#ff0000', strokeOpacity: 0.8}) // 建立多边形覆盖物
      ply.setFillOpacity(0.1)
      this.map.addOverlay(ply)
      ply.hide()
      return ply
    },
    axiosRequest: function (postconfig) { // 删除多个gemetry，批量删除
      return this.axios(postconfig)
    },
    selectLayer: function (e, layer, index) { // 选择图层
      if (this.activeLayer !== index) {
        this.activeLayer = index
        this.mask.setFocus(layer)
      }
    },
    confirmDelete: function (layer, index) {
      var that = this
      this.$Modal.confirm({
        title: '请确认是否删除',
        content: '<p>删除后不可恢复，请注意！</p>',
        onOk: () => {
          that.deleteExcute(layer, index)
        },
        onCancel: () => {
        }
      })
    },
    deleteExcute: function (layer, index) {
      var that = this
      var overlayset = this.geometrysInLayer[layer.layerId]
      var myOverlays = overlayset == undefined ? [] : Array.from(overlayset)
      that.deleteGeometrys(myOverlays).then(
        res => {
          console.log(res)
          that.mask.deleteLayer(layer)
          that.$Message.info('删除图层内容成功')
          return that.removeLayer(layer.layerId)
        }
      ).then(res => {
        console.log(res)
        that.layersget.splice(index, 1)
        that.$Message.info('删除图层成功')
        if (that.layersget.length > 0) {
          that.activeLayer = 0
          that.mask.setFocus(this.layersget[0])
        }
      }).catch(error => {
        console.log(error)
        that.$Message.info('删除图层内容未成功')
      })
    },
    deleteLayer: function (e, layer, index) { // 删除图层及其内容
      this.confirmDelete(layer, index)
    },
    removeLayer (layerId) {
      var postconfig = {
        method: 'post',
        url: 'api/removelayer',
        dataType: 'json',
        data: {id: layerId},
        transformRequest: [function (data) { // 登录时处理数据格式,处理后后台接收的参数为data按顺序传递
          let ret = ''
          for (let it in data) {
            ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
          }
          return ret
        }]
      }
      return this.axios(postconfig)
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
      this.mask.setFocus(this.layersget[0])
    },
    drawerClose: function () { // 选择背景地图的drawer关闭
      if (this.$refs.tree.getSelectedNodes().length === 0) {
        this.$Message.info('没有选择背景图层')
      } else {
        var backcounty = this.$refs.tree.getSelectedNodes()[0].title
        if (backcounty !== this.layersget[this.activeLayer].layerDes) {
          var that = this
          // this.layersget[this.activeLayer].layerDes = backcounty
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
        layer.layerDes = backcounty
        me.mask.addBackground(layer)
        me.mask.setFocus(layer)
      })
    },
    saveBackground: function (layer) {
      var postconfig = {
        method: 'post',
        url: 'api/savelayer',
        dataType: 'json',
        data: layer,
        contentType: 'application/json'
      }
      return this.axios(postconfig)
    },
    shallowCopy: function (myOverlay) {
      var dst = {}
      var src = myOverlay._gridPoly
      for (var prop in src) {
        if (src.hasOwnProperty(prop)) {
          if (prop == 'geometryData') {
            dst[prop] = Array.from(src[prop]).map(function (item) {
              var formatPoints = []
              for (let point of item.getPath()) {
                formatPoints.push([point.lng, point.lat])
              }
              return formatPoints
            })
          } else {
            dst[prop] = src[prop]
          }
        }
      }
      return dst
    },
    addGeometrys: function (addMyOverlays) {
      var obj1 = addMyOverlays.map(this.shallowCopy)
      var postconfig = {
        method: 'post',
        url: 'api/addgeometrys',
        dataType: 'json',
        data: obj1,
        contentType: 'application/json'
      }
      return this.axios(postconfig)
    },
    editGeometrys: function (editMyOverlays) {
      var obj1 = editMyOverlays.map(this.shallowCopy)
      var postconfig = {
        method: 'post',
        url: 'api/editgeometrys',
        dataType: 'json',
        data: obj1,
        contentType: 'application/json'
      }
      return this.axios(postconfig)
    },
    deleteGeometrys: function (deleteMyOverlays) {
      var obj1 = []
      for (let myOverlay of deleteMyOverlays) {
        obj1.push(myOverlay._gridPoly.geometryId)
      }
      var postconfig = {
        method: 'post',
        url: 'api/removegeometrys',
        dataType: 'json',
        data: obj1,
        contentType: 'application/json'
      }
      return this.axios(postconfig)
    },
    savePolygon: function (myoverlay) {
      console.log('savePolygon')
      console.log(myoverlay)
      var that = this
      var editMyOverlays = []
      editMyOverlays.push(myoverlay)
      this.editGeometrys(editMyOverlays).then(
        res => {
          myoverlay._isEdit = 0
          myoverlay.deleteEditPoint()
        }
      ).catch(
        error => {
          console.log(error)
        }
      )
    },
    saveLayer: function (e, layerId, index) { // 保存图层  layer为数据，是layerget数组中的单元
      var layer = this.layersget[this.activeLayer]
      var that = this
      var myOverlays = this.geometrysInLayer[layerId] // 为map数据集合,key为geometyrId,value为geometry
      var deleteMyOverlays = []
      var editMyOverlays = []
      var addMyOverlays = []
      if (myOverlays !== undefined) {
        for (let myoverlay of myOverlays) {
          if (myoverlay._isAdd == 1 && myoverlay._isEdit !== 2) { // this.overlayMap为map数据集合,key为geometry,value为MyOverlay
            addMyOverlays.push(myoverlay)
          } else if (myoverlay._isEdit == 1) {
            editMyOverlays.push(myoverlay)
          } else if (myoverlay._isEdit == 2) {
            deleteMyOverlays.push(myoverlay)
          }
        }
      }
      this.axios.all([that.deleteGeometrys(deleteMyOverlays), that.editGeometrys(editMyOverlays), that.addGeometrys(addMyOverlays), that.saveBackground(layer)])
        .then(this.axios.spread(function (del, edit, acct, perms) {
          that.synchAdd(acct.data.msg, addMyOverlays)
          that.synchEdit(editMyOverlays)
          that.synchDelete(deleteMyOverlays)
          that.$Message.info('保存成功')
        })).catch(error => {
          that.$Message.info('保存未成功')
          console.log(error)
        })
    },
    synchAdd: function (addMyOverlaysId, addMyOverlays) {
      for (let index in addMyOverlays) {
        addMyOverlays[index]._gridPoly.geometryId = addMyOverlaysId[index]
        addMyOverlays[index].setAddFlag(0)
      }
    },
    synchEdit: function (editMyOverlays) {
      for (let myOverlay of editMyOverlays) {
        myOverlay.setEditFlag(0)
      }
    },
    synchDelete: function (deleteMyOverlays) {
      for (let myOverlay of deleteMyOverlays) {
        myOverlay = null
      }
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
        geometryName: '',
        geometryDes: '',
        isBackground: 'BD09',
        layerId: layer.layerId
      }
      gridPoly.geometryData = new Set(this.plyzones)// this.plyzones.slice(0)// this.polyPathToJson(e.overlay.getPath())
      this.$Modal.confirm({
        title: '请输入网格信息：',
        render: (h) => {
          const inputData = [{
            domProps: {
              value: gridPoly.geometryName,
              autofocus: true,
              placeholder: '请输入网格名字...',
              style: 'color:red;width:100%;margin-bottom:8px'
            },
            on: {
              input: (val) => {
                gridPoly.geometryName = val.target.value
              }
            }
          },
          {
            domProps: {
              value: gridPoly.geometryDes,
              autofocus: true,
              placeholder: '请输入网格负责人...',
              style: 'color:red;width:100%'
            },
            on: {
              input: (val) => {
                gridPoly.geometryDes = val.target.value
              }
            }
          }
          ]
          return h('div', inputData.map(item => h('input', item)))
        },
        onOk: function () {
          that.mask.addGridZone(gridPoly, layer)
        },
        onCancel: function () {
          for (var overlay of gridPoly.geometryData) {
            that.map.removeOverlay(overlay)
          }
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
