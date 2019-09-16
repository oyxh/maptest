/* eslint-disable eqeqeq */
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
  console.log(this._overlayMap)
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
    console.log(ply.getPath())
    pointArray = pointArray.concat(ply.getPath())
    this._map.addOverlay(ply)
    ply.hide()
  }
  console.log(pointArray)
  this._overlayMap.set(layer, backgroundPly)
  this._map.setViewport(pointArray)
}
Mask.prototype.deleteOverlays = function (layerId) { // 删除 layserId上的所有覆盖5️⃣
}
Mask.prototype.setFocus = function (layer) {
  var me = this
  var lastLayerGround = me._overlayMap.get(this._activeLayer)
  if (lastLayerGround !== undefined) {
    for (let ply of lastLayerGround) {
      ply.hide()
    }
  }
  this._activeLayer = layer
  var layerData = me._overlayMap.get(layer)
  var pointArray = []
  if (layerData === undefined) {
    pointArray.push(new window.BMap.Point(116.404, 39.915))
  } else {
    for (let ply of layerData) {
      ply.show()
      pointArray = pointArray.concat(ply.getPath())
    }
  }
  console.log(pointArray)
  this._map.setViewport(pointArray)
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
