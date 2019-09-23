function MyOverlay (gridPoly, mask) {
  this._gridPoly = gridPoly
  this._mask = mask
  this.initialize()
}
MyOverlay.prototype.initialize = function () {
  console.log('myOVerlay')
  var markerMenu = new window.BMap.ContextMenu()
  markerMenu.addItem(new window.BMap.MenuItem('删除区域', this.removeMyOverlay.bind(this)))
  markerMenu.addItem(new window.BMap.MenuItem('变更名字', this.editName.bind(this)))
  markerMenu.addItem(new window.BMap.MenuItem('编辑区域', this.editMyOverlay.bind(this)))
  markerMenu.addItem(new window.BMap.MenuItem('保存编辑', this.editClose.bind(this)))
  for (var ply of this._gridPoly.polygonData) {
    ply.addContextMenu(markerMenu)
    ply.addEventListener('mouseover', this.mouseover.bind(this))
    ply.addEventListener('mouseout', this.mouseout.bind(this))
  }
}
MyOverlay.prototype.removeMyOverlay = function (e, ee) {
  console.log('removeMyOverlay')
}
MyOverlay.prototype.editMyOverlay = function (e, ee) {
  console.log('editMyOverlay')
}
MyOverlay.prototype.editClose = function (e, ee) {
  console.log('editClose')
}
MyOverlay.prototype.editName = function (e, ee) {
  console.log('editClose')
}
MyOverlay.prototype.mouseover = function (e, ee) {
  for (var ply of this._gridPoly.polygonData) {
    ply.setFillColor('red')
    ply.setFillOpacity(0.2)
  }
}
MyOverlay.prototype.mouseout = function (e, ee) {
  for (var ply of this._gridPoly.polygonData) {
    ply.setFillColor('none')
    ply.setFillOpacity(0)
  }
}
export default MyOverlay
