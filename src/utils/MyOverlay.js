/* eslint-disable eqeqeq */
import MyPolygon from './MyPolygon'
import LitOverlay from './LitOverlay'
import EditOverlay from './EditOverlay'
function MyOverlay (gridPoly, mask) {
  this._gridPoly = gridPoly
  this._mask = mask
  this._isEdit = 0 // 0 不变，1，编辑，2 删除
  this._isAdd = 0 // 0 原有，1 添加
  this._editOverlays = new Map()
  this._overlayLabels = new Map()
  this._polygons = new Map()
  if (this._gridPoly.isBackground !== 'BD09') {
    this._isEdit = 1
    this._gridPoly.isBackground = 'BD09'
  }
  for (var ply of this._gridPoly.geometryData) {
    if (this._map == undefined) {
      this._map = ply.getMap()
    }
    var markerMenu = new window.BMap.ContextMenu()
    markerMenu.addItem(new window.BMap.MenuItem('删除区域', this.removeMyOverlay.bind(this)))
    markerMenu.addItem(new window.BMap.MenuItem('变更名字', this.editName.bind(this)))
    markerMenu.addItem(new window.BMap.MenuItem('编辑区域', this.editMyOverlay.bind(this)))
    markerMenu.addItem(new window.BMap.MenuItem('保存编辑', this.editClose.bind(this)))
    ply.addContextMenu(markerMenu)
    ply.addEventListener('mouseover', this.mouseover.bind(this))
    ply.addEventListener('mouseout', this.mouseout.bind(this))
    this.showLabel()
    this.initialize(ply)
  }
}
MyOverlay.prototype.initialize = function (ply) {
  var editOverlay = new EditOverlay(ply, this._mask)
  this._editOverlays.set(ply, editOverlay)
}
MyOverlay.prototype.removeMyOverlay = function (e, ee, polygon) {
  this._map.removeOverlay(polygon) // 删除地图上的覆盖物
  this._overlayLabels.get(polygon).remove() // 移除名字
  console.log(this._editOverlays.get(polygon))
  this._editOverlays.get(polygon).delete() // 移除编辑点
  this._gridPoly.geometryData.delete(polygon) // 删除数据
  this._isEdit = (this._gridPoly.geometryData.size - 1) > 0 ? 1 : 2 // 设置状态
}
MyOverlay.prototype.editMyOverlay = function (e, ee, polygon) {
  console.log('editMyOverlay')
  this._isEdit = 1
  this._editOverlays.get(polygon).initialize()
  // this._editOverlays.set(polygon, editOverlay)
}
MyOverlay.prototype.editClose = function (e, ee) {
  console.log(this._mask._layerItem)
  console.log('editClose')
  console.log(this._mask._layerItem)
  this._mask._layerItem.savePolygon(this)
  console.log('editClose')
}
MyOverlay.prototype.editName = function (e, ee, polygon) {
  var that = this
  this._mask._layerItem.$Modal.confirm({
    title: '请输入网格信息：',
    render: (h) => {
      const inputData = [{
        domProps: {
          value: that._gridPoly.geometryName,
          autofocus: true,
          style: 'color:red;width:100%;margin-bottom:8px'
        },
        on: {
          input: (val) => {
            if (val.target.value !== that._gridPoly.geometryName) {
              that._labelName = that._gridPoly.geometryName = val.target.value
              that._isEdit = true
            }
          }
        }
      },
      {
        domProps: {
          value: that._gridPoly.geometryDes,
          autofocus: true,
          placeholder: '请输入网格负责人...',
          style: 'color:red;width:100%'
        },
        on: {
          input: (val) => {
            if (val.target.value !== that._gridPoly.geometryDes) {
              that._gridPoly.geometryDes = val.target.value
              that._isEdit = true
            }
          }
        }
      }
      ]
      return h('div', inputData.map(item => h('input', item)))
    },
    onOk: function () {
      that.showLabel() // 变更名字
    },
    onCancel: function () {
    }
  })
}
MyOverlay.prototype.mouseover = function (e) {
  this._activePly = e.target
  for (var ply of this._gridPoly.geometryData) {
    ply.setFillColor('red')
    ply.setFillOpacity(0.2)
  }
}
MyOverlay.prototype.mouseout = function (e) {
  for (let ply of this._gridPoly.geometryData) {
    ply.setFillColor('none')
    ply.setFillOpacity(0)
  }
}
MyOverlay.prototype.setAddFlag = function (addFlag) {
  this._isAdd = addFlag
}
MyOverlay.prototype.setEditFlag = function (editFlag) {
  this._isEdit = editFlag
}
MyOverlay.prototype.showLabel = function () { // 显示多边形的名字
  this._labelName = this._gridPoly.geometryName
  for (let ply of this._gridPoly.geometryData) {
    this.oneOverlayLabel(ply)
  }
}
MyOverlay.prototype.oneOverlayLabel = function (overlay) {
  var orioverLabel = this._overlayLabels.get(overlay)
  if (orioverLabel !== undefined) {
    this._map.removeOverlay(orioverLabel)
  }
  var pointArray = overlay.getPath()
  var polygon = new MyPolygon(pointArray, this._map)
  var labelPositoin = polygon.getSevaralPoint(this._labelName.length)
  var overlayLabel = new LitOverlay(labelPositoin, this._labelName)
  this._map.addOverlay(overlayLabel)
  overlayLabel.draw()
  overlayLabel.show()
  this._overlayLabels.set(overlay, overlayLabel)
  this._polygons.set(overlay, polygon)
}
MyOverlay.prototype.hide = function () {
  for (let [overlay, overlayLabel] of this._overlayLabels) {
    overlay.hide()
    overlayLabel.hide()
  }
  for (let editOverlay of this._editOverlays.values()) {
    editOverlay.hide()
  }
}
MyOverlay.prototype.show = function () {
  for (let [overlay, overlayLabel] of this._overlayLabels) {
    overlay.show()
    overlayLabel.show()
  }
  for (let editOverlay of this._editOverlays.values()) {
    editOverlay.show()
  }
}
MyOverlay.prototype.delete = function () {
  for (let [overlay, overlayLabel] of this._overlayLabels) {
    this._map.removeOverlay(overlay)
    overlayLabel.remove()
    overlay = null
  }
  this.deleteEditPoint()
}
MyOverlay.prototype.redrawGeometrys = function () {
  for (let [overlay] of this._overlayLabels) {
    this._map.removeOverlay(overlay)
    this._map.addOverlay(overlay)
  }
  this.deleteEditPoint()
}
MyOverlay.prototype.deleteEditPoint = function () {
  for (let editOverlay of this._editOverlays.values()) {
    editOverlay.delete()
  }
}
MyOverlay.prototype.setRadius = function (radius) {
  for (let editOverlay of this._editOverlays.values()) {
    editOverlay.setRadius(radius)
  }
}
MyOverlay.prototype.contains = function (point) {
  var containFlag = false
  for (let polygon of this._polygons.values()) {
    if (polygon.contains({x: point.lng, y: point.lat})) {
      containFlag = true
      return containFlag
    }
  }
  return containFlag
}
export default MyOverlay
