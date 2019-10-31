/* eslint-disable eqeqeq */
import MyOverlay from './MyOverlay'

function Mask (map, geometrysInLayer, overlayMap, layerItem) {
  this._map = map
  this._geometrysInLayer = geometrysInLayer
  this._overlayMap = overlayMap
  this._layerItem = layerItem
  this.initialize()
}
Mask.prototype.initialize = function () {
  this._map.addEventListener('zoomend', this.zoomAction.bind(this))
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
  var myOverlaysSet = this._geometrysInLayer[layer.layerId]
  if (myOverlaysSet !== undefined) {
    for (let myOverlay of myOverlaysSet) {
      myOverlay.redrawGeometrys()
    }
  }
}
Mask.prototype.deleteOverlays = function (layerId) { // 删除 layserId上的所有覆盖5️⃣
}
Mask.prototype.deleteLayer = function (layer) {
  if (layer !== undefined) {
    var me = this
    var lastLayerGround = me._overlayMap.get(layer)
    if (lastLayerGround !== undefined) {
      for (let ply of lastLayerGround) {
        this._map.removeOverlay(ply)
      }
    }
    me._overlayMap.delete(layer)
    var myOverlaysSet = this._geometrysInLayer[layer.layerId]
    if (myOverlaysSet !== undefined) {
      for (let myOverlay of myOverlaysSet) {
        myOverlay.delete()
      }
    }
    this._geometrysInLayer[layer.layerId] = null
    this._activeLayer = null
  }
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
      for (let myOverlay of myOverlaysSet) {
        myOverlay.hide()
      }
    }
  }
}
Mask.prototype.showLayer = function (layer) {
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
  if (myOverlaysSet !== undefined) {
    for (let myOverlay of myOverlaysSet) {
      myOverlay.show()
      for (let overlay of myOverlay._gridPoly.geometryData) {
        if (addBackFlag) {
          pointArray = pointArray.concat(overlay.getPath())
        }
      }
    }
  }
  console.log(pointArray)
  if (pointArray.length == 0) {
    pointArray.push(new window.BMap.Point(116.404, 39.915))
  }
  console.log(pointArray)
  me._map.setViewport(pointArray)
}
Mask.prototype.setFocus = function (layer) {
  var me = this
  console.log(layer)
  console.log(this._activeLayer)
  if (this._activeLayer !== null) {
    me.hideLayer(this._activeLayer)
  }
  this._activeLayer = layer
  me.showLayer(layer)
}
Mask.prototype.addGridZone = function (gridPoly, layer) {
  var myOverlays = new MyOverlay(gridPoly, this)
  var layerId = gridPoly.layerId || layer.layerId
  if (this._geometrysInLayer[layerId] == undefined) {
    this._geometrysInLayer[layerId] = new Set()
  }
  if (layer !== undefined) {
    myOverlays.setAddFlag(1)
  }
  // this.$store.commit('geometrysInLayerAdd', layerId, myOverlays)
  this._geometrysInLayer[layerId].add(myOverlays)
}
Mask.prototype.getCircleRadius = function () {
  var centre = this._map.getCenter()
  let pixPoint = this._map.pointToPixel(centre)
  pixPoint.y += 3
  let point = this._map.pixelToPoint(pixPoint)
  return this._map.getDistance(centre, point)
}
Mask.prototype.getDistance = function (point1, point2) {
  return Math.sqrt((point1.lng - point2.lng) * (point1.lng - point2.lng) + (point1.lat - point2.lat) * (point1.lat - point2.lat))
}
Mask.prototype.zoomAction = function (e) {
  var radius = this.getCircleRadius()
  var layer = this._activeLayer
  if (this._activeLayer == undefined) {
    return
  }
  var myOverlaysSet = this._geometrysInLayer[layer.layerId]
  if (myOverlaysSet !== undefined) {
    for (let myOverlay of myOverlaysSet) {
      myOverlay.setRadius(radius) //  修改编辑点的半径
    }
  }
}
Mask.prototype.nearPoint = function (point, radius, editOverlay) {
  var layer = this._activeLayer
  if (this._activeLayer == undefined) {
    return
  }
  var myOverlaysSet = this._geometrysInLayer[layer.layerId] // 当前页面的
  if (myOverlaysSet !== undefined) {
    for (let myOverlay of myOverlaysSet) {
      for (let value of myOverlay._editOverlays.values()) {
        if (value !== editOverlay) {
          var insect = value.getInsect(point, radius)
          if (insect instanceof window.BMap.Point) {
            return insect
          }
        }
      }
    }
  }
}
export default Mask
