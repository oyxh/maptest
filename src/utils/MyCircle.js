/* eslint-disable eqeqeq */
function MyCircle (map, centre, radius, type, editOverlay) {
  this._map = map
  this._centre = centre
  this._radius = radius
  this._type = type
  this._editOverlay = editOverlay
  this._startFlag = false
  this.initialize()
}
MyCircle.prototype.initialize = function () {
  this._color = (this._type == 'point') ? 'blue' : 'green'
  this._radius = (this._type == 'point') ? this._radius : this._radius * 0.9
  this._circle = new window.BMap.Circle(this._centre, this._radius)
  this._circle.setFillColor(this._color)
  this._circle.setStrokeColor(this._color)
  this._circle.setFillOpacity(1)
  var markerMenu = new window.BMap.ContextMenu()
  markerMenu.addItem(new window.BMap.MenuItem('删除点', this.deletePoint.bind(this)))
  if (this._type == 'point') {
    this._circle.addContextMenu(markerMenu)
  }
  this._circle.addEventListener('click', this.startAction.bind(this))
  this._circle.addEventListener('dblclick', this.endAction.bind(this))
}
MyCircle.prototype.deletePoint = function (e, ee) {
  this._editOverlay.deletePoint(this)
}
MyCircle.prototype.startAction = function (e) {
  console.log(this._startFlag, 'startAction')
  // this._circle.addEventListener('dblclick', this.endAction.bind(this))
  this._editOverlay.editPoint(this)
/*  if (!this._startFlag) {
    this._startFlag = true
    this._editOverlay.editPoint(this)
  } */
}
MyCircle.prototype.endAction = function (e) {
  console.log(this)
  this._editOverlay.endEdit(this)
  // this._circle.removeEventListener('click', this.startAction.bind(this))
  this._startFlag = false
  // this._circle.removeEventListener('dblclick', this.endAction.bind(this))
}
MyCircle.prototype.setRadius = function (radius) {
  this._radius = (this._type == 'point') ? radius : radius * 0.9
  this._circle.setRadius(this._radius)
}
MyCircle.prototype.hide = function () {
  this._circle.hide()
}
MyCircle.prototype.show = function () {
  this._circle.show()
}
export default MyCircle
