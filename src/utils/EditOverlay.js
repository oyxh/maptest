/* eslint-disable eqeqeq */

import MyCircle from './MyCircle'
import MyPolygon from './MyPolygon'
function EditOverlay (overlay, mask) {
  this._map = overlay.getMap()
  this._overlay = overlay
  this._mask = mask
  this._pointArray = this._overlay.getPath()
  this._polygon = new MyPolygon(this._pointArray, this._map)
  this._middleArray = []
  this._pointCircles = []
  this._middleCircles = []
}
EditOverlay.prototype.initialize = function () {
  this._pointArray = this._overlay.getPath()
  this._polygon = new MyPolygon(this._pointArray, this._map)
  this._middleArray = []
  this._pointCircles = []
  this._middleCircles = []
  for (let i = 0; i < this._pointArray.length; i++) {
    this._middleArray.push(this.getMiddlePoint(this._pointArray[i], this._pointArray[(i + 1) % this._pointArray.length]))
  }
  var radius = this._mask.getCircleRadius()
  for (let i = 0; i < this._pointArray.length; i++) {
    var mycircle = new MyCircle(this._map, this._pointArray[i], radius, 'point', this)
    var mymiddle = new MyCircle(this._map, this._middleArray[i], radius, 'middle', this)
    this.addEditPoints(mycircle)
    this.addEditPoints(mymiddle)
  }
}
EditOverlay.prototype.getMiddlePoint = function (point1, point2) {
  var midLng = (point1.lng + point2.lng) / 2
  var midLat = (point1.lat + point2.lat) / 2
  return new window.BMap.Point(midLng, midLat)
}
EditOverlay.prototype.getIndex = function (mycircle) {
  var index = -1
  for (let i = 0; i < this._pointArray.length; i++) {
    var tempPoint = (mycircle._type == 'point') ? this._pointArray[i] : this._middleArray[i]
    if (tempPoint == mycircle._circle.getCenter()) {
      index = i
      return index
    }
  }
  return index
}
EditOverlay.prototype.getInsect = function (point, radius) {
  for (let i = 0; i < this._pointCircles.length; i++) {
    if (this._mask.getDistance(point, radius) <
      this._pointCircles[i]._circle.getRadius() + radius) {
      return this._pointCircles[i]._circle.getCenter()
    }
    if (this._map.getDistance(this._middleCircles[i]._circle.getCenter(), point) <
      this._middleCircles[i]._circle.getRadius() + radius) {
      return this._middleCircles[i]._circle.getCenter()
    }
  }
  var pointObject = this._polygon.getLineInsect(point, radius)
  if (pointObject !== undefined) {
    return new window.BMap.Point(pointObject.x, pointObject.y)
  }
}
EditOverlay.prototype.addEditPoints = function (mycircle) {
  this._map.addOverlay(mycircle._circle)
  if (mycircle._type == 'point') {
    this._pointCircles.push(mycircle)
  } else {
    this._middleCircles.push(mycircle)
  }
}
EditOverlay.prototype.deletePoint = function (mycircle) {
  var index = this.getIndex(mycircle)
  var arrayLength = this._pointArray.length
  if (arrayLength <= 3) {
    return
  }
  var pre = (index + arrayLength - 1) % arrayLength
  var next = (index + 1) % arrayLength
  this._map.removeOverlay(this._pointCircles[index]._circle)
  this._map.removeOverlay(this._middleCircles[pre]._circle)
  this._map.removeOverlay(this._middleCircles[index]._circle)
  var middle = this.getMiddlePoint(this._pointArray[pre], this._pointArray[next])
  var radius = this._mask.getCircleRadius()
  var newMiddle = new MyCircle(this._map, middle, radius, 'middle', this)
  this._pointArray.splice(index, 1)
  this._pointCircles.splice(index, 1)
  this._middleArray.splice(pre, 2, middle)
  this._middleCircles.splice(pre, 2, newMiddle)
  this._map.addOverlay(newMiddle._circle)
  this.redrawPolygon()
}
EditOverlay.prototype.editPoint = function (mycircle) {
  this._map.disableDoubleClickZoom()
  var me = this
  this._moveAction = function (e) {
    var insect = me._mask.nearPoint(e.point, mycircle._circle.getRadius() * 2, me)
    var replacePoint = e.point
    if (insect instanceof window.BMap.Point) {
      replacePoint = insect
    }
    var index = me.getIndex(mycircle)
    me.replacePoint(index, mycircle, replacePoint)
    me.redrawPolygon()
  }
  if (!this._mousemoveFlag) {
    this._mousemoveFlag = true
    this._map.addEventListener('mousemove', this._moveAction)
  }
}
EditOverlay.prototype.replacePoint = function (index1, mycircle, point) { // 替换节点,点击后变化，分点击节点和点击中点
  var index = this.getIndex(mycircle)
  var pointLength = this._pointArray.length
  var pre = (index - 1 + pointLength) % pointLength
  var next = (index + 1) % pointLength
  var radius = this._mask.getCircleRadius()
  mycircle._circle.setCenter(point)
  if (mycircle._type == 'point') {
    this._pointArray.splice(index, 1, point)
    var add1 = this.getMiddlePoint(this._pointArray[pre], this._pointArray[index])
    var add2 = this.getMiddlePoint(this._pointArray[index], this._pointArray[next])
    this._middleCircles[pre]._circle.setCenter(add1)
    this._middleCircles[index]._circle.setCenter(add2)
    this._middleArray.splice(pre, 1, add1)
    this._middleArray.splice(index, 1, add2)
  } else {
    var addmiddles = []
    addmiddles.push(this.getMiddlePoint(this._pointArray[index], point))
    addmiddles.push(this.getMiddlePoint(point, this._pointArray[next]))
    this._middleArray.splice(index, 1)
    this._middleCircles.splice(index, 1)
    for (let i = 0; i < addmiddles.length; i++) {
      var addMiddle = new MyCircle(this._map, addmiddles[i], radius, 'middle', this)
      this._map.addOverlay(addMiddle._circle)
      this._middleArray.splice(index + i, 0, addmiddles[i])
      this._middleCircles.splice(index + i, 0, addMiddle)
    }
    this._pointArray.splice(index + 1, 0, point)
    this._pointCircles.splice(index + 1, 0, mycircle)
    mycircle._type = 'point'
    mycircle._circle.setRadius(radius)
    mycircle._circle.setFillColor('blue')
    mycircle._circle.setStrokeColor('blue') //  编辑点颜色改变
  }
}
EditOverlay.prototype.endEdit = function (mycircle) {
  this._map.removeEventListener('mousemove', this._moveAction)
  this._mousemoveFlag = false
}
EditOverlay.prototype.setRadius = function (radius) {
  for (let i = 0; i < this._pointCircles.length; i++) {
    this._pointCircles[i].setRadius(radius)
    this._middleCircles[i].setRadius(radius)
  }
}
EditOverlay.prototype.hide = function () {
  for (let i = 0; i < this._pointCircles.length; i++) {
    this._pointCircles[i].hide()
    this._middleCircles[i].hide()
  }
}
EditOverlay.prototype.show = function () {
  for (let i = 0; i < this._pointCircles.length; i++) {
    this._pointCircles[i].show()
    this._middleCircles[i].show()
  }
}
EditOverlay.prototype.delete = function () {
  console.log('delete points')
  for (let i = 0; i < this._pointCircles.length; i++) {
    this._map.removeOverlay(this._pointCircles[i]._circle)
    this._map.removeOverlay(this._middleCircles[i]._circle)
  }
}
EditOverlay.prototype.redrawPolygon = function () {
  this._overlay.setPath(this._pointArray)
  this._polygon = new MyPolygon(this._pointArray, this._map)
}
export default EditOverlay
