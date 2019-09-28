/* eslint-disable eqeqeq */
import MyOverlay from './MyOverlay'

function Mask (map, geometrys, geometrysInLayer, overlayMap, layerItem) {
  this._map = map
  this._geometrys = geometrys
  this._geometrysInLayer = geometrysInLayer
  this._overlayMap = overlayMap
  this._myOverlays = []
  this._layerItem = layerItem
  this.initialize()
}
Mask.prototype.initialize = function () {
  for (let i = 0; i < this._geometrys.length; i++) {
    this.generateOverlay(this._geometrys[i])
  }
  this._map.addEventListener('zoomend', this.zoomAction.bind(this))
  // this.setFocus(this.layersget[0].layerId)
}
Mask.prototype.generateOverlay = function (geometry, type) {
}
Mask.prototype.addOverlay = function (geometry) {
}
Mask.prototype.addBackground = function (layer) {
  var layerData = layer.layerData
  if (layer.layerData == undefined) {
    return
  }
  if (this._overlayMap.get(layer) !== undefined) {
    let existBackground = this._overlayMap.get(layer)
    for (let ply of existBackground) {
      this._map.removeOverlay(ply)
    }
  }
  var backgroundPly = []
  var pointArray = []
  for (var i = 0; i < layerData.length; i++) {
    var ply = new window.BMap.Polygon(layerData[i], {strokeWeight: 2, strokeColor: '#ff0000', strokeOpacity: 0.8}) // 建立多边形覆盖物
    ply.setFillOpacity(0.1)
    backgroundPly.push(ply)
    pointArray = pointArray.concat(ply.getPath())
    this._map.addOverlay(ply)
    ply.hide()
  }
  this._overlayMap.set(layer, backgroundPly)
  this._map.setViewport(pointArray)
}
Mask.prototype.deleteOverlays = function (layerId) { // 删除 layserId上的所有覆盖5️⃣
}
Mask.prototype.hideLayer = function (layer) {
  if (layer !== undefined) {
    var me = this
    var lastLayerGround = me._overlayMap.get(layer)
    if (lastLayerGround !== undefined) {
      for (let ply of lastLayerGround) {
        ply.hide()
      }
    }
    var myOverlaysSet = this._geometrysInLayer[layer.layerId]
    if (myOverlaysSet !== undefined) {
      console.log(myOverlaysSet)
      for (let myOverlay of myOverlaysSet) {
        for (let overlay of myOverlay._gridPoly.geometryData) {
          overlay.hide()
        }
      }
    }
  }
}
Mask.prototype.showLayer = function (layer) {
  console.log(layer)
  var me = this
  var pointArray = []
  var layerData = me._overlayMap.get(layer)
  if (layerData === undefined) {
  } else {
    for (let ply of layerData) {
      ply.show()
      pointArray = pointArray.concat(ply.getPath())
    }
  }
  var addBackFlag = false
  if (pointArray.length == 0) {
    addBackFlag = true
  }
  var myOverlaysSet = this._geometrysInLayer[layer.layerId]
  console.log(myOverlaysSet)
  if (myOverlaysSet !== undefined) {
    for (let myOverlay of myOverlaysSet) {
      for (let overlay of myOverlay._gridPoly.geometryData) {
        overlay.show()
        if (addBackFlag) {
          pointArray = pointArray.concat(overlay.getPath())
        }
      }
    }
  }

  if (pointArray.length == 0) {
    pointArray.push(new window.BMap.Point(116.404, 39.915))
  }
  console.log(pointArray)
  me._map.setViewport(pointArray)
}
Mask.prototype.setFocus = function (layer) {
  var me = this
  me.hideLayer(this._activeLayer)
  this._activeLayer = layer
  me.showLayer(layer)
}
Mask.prototype.addGridZone = function (layer, gridPoly) {
  var myOverlays = new MyOverlay(gridPoly)
  myOverlays.setAddFlag(1)
  if (this._geometrysInLayer[layer.layerId] == undefined) {
    this._geometrysInLayer[layer.layerId] = new Set()
  }
  this._geometrysInLayer[layer.layerId].add(myOverlays)
  console.log(this._geometrysInLayer)
}
Mask.prototype.getCircleRadius = function () {
}
Mask.prototype.getDistance = function (point1, point2) {
  return Math.sqrt((point1.lng - point2.lng) * (point1.lng - point2.lng) + (point1.lat - point2.lat) * (point1.lat - point2.lat))
}
Mask.prototype.zoomAction = function (e) {
}
Mask.prototype.nearPoint = function (point, radius, myOverlay) {
  for (let i = 0; i < this._myOverlays.length; i++) {
    var value = this._myOverlays[i]
    if (value !== myOverlay && !value._isHide) {
      var insect = value.getInsect(point, radius)
      if (insect instanceof window.BMap.Point) {
        return insect
      }
    }
  }
}
export default Mask
