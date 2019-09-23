/* eslint-disable eqeqeq */
function MyOverlay (gridPoly, mask) {
  this._gridPoly = gridPoly
  this._mask = mask
  this._isEdit = 0 // 0 不变，1，编辑，2 删除
  this._isAdd = 0 // 0 原有，1 添加
  this.initialize()
}
MyOverlay.prototype.initialize = function () {
  console.log('myOVerlay')
  for (var ply of this._gridPoly.polygonData) {
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
  }
}
MyOverlay.prototype.removeMyOverlay = function (e, ee, polygon) {
  this._map.removeOverlay(polygon)
  this._gridPoly.polygonData.delete(polygon)
  this._isEdit = this._gridPoly.polygonData.size > 0 ? 1 : 2
  console.log(this._isEdit)
}
MyOverlay.prototype.editMyOverlay = function (e, ee, polygon) {
  console.log('editMyOverlay')
}
MyOverlay.prototype.editClose = function (e, ee) {
  console.log('editClose')
}
MyOverlay.prototype.editName = function (e, ee) {
  console.log('editClose')
}
MyOverlay.prototype.mouseover = function (e) {
  this._activePly = e.target
  console.log(e.target)
  for (var ply of this._gridPoly.polygonData) {
    ply.setFillColor('red')
    ply.setFillOpacity(0.2)
  }
}
MyOverlay.prototype.mouseout = function (e) {
  for (var ply of this._gridPoly.polygonData) {
    ply.setFillColor('none')
    ply.setFillOpacity(0)
  }
}
MyOverlay.prototype.setAddFlag = function (addFlag) {
  this._isAdd = addFlag
  console.log(this._isAdd)
}
export default MyOverlay
