<template>
    <div :style="{'height':fullWindowPx }">
      <div class="leftsider" :class={active:isActiveStatis} >
        <div class="split">
            <div slot="top" class="split-pane ">
              <br>
              <a href="javascript:;" class="uploadfile">选择文件
                <input type="file" ref="upload" accept=".xls,.xlsx"  name="" id="">
              </a>
              <Button class="uploadbutton" @click = "clearData">清除数据</Button>
              <p class="pstyle" >
                <!--选择文件中必须有｛经度、纬度｝或｛X、Y｝或｛lng、lat｝,列数不超过10行，不超过1M-->
                如果导入数据中有经纬度，请选择坐标
              </p>
              <RadioGroup v-model="maptype">
                <Radio :label="laberBaidu" border></Radio>
                <Radio :label="laberWGS" border></Radio>
              </RadioGroup>
              <Divider dashed />
              <Select v-model="addressCol" class="select" placeholder = "请选择地址列">
                <Option v-for="item in this.columnsInput" :value="item.title" :key="item.title">{{ item.title }}</Option>
              </Select>
              <br>
              <br>
              <Select v-model="lngCol" style="width:200px" placeholder = "请选择经度列">
                <Option v-for="item in this.columnsInput" :value="item.title" :key="item.title">{{ item.title }}</Option>
              </Select>
              <br>
              <br>
              <Select v-model="latCol" style="width:200px" placeholder = "请选择纬度列">
                <Option v-for="item in this.columnsInput" :value="item.title" :key="item.title">{{ item.title }}</Option>
              </Select>
              <Divider dashed />
              <p class="pstyle" >
                请选择定位优先级：
              </p>
              <RadioGroup v-model="locationFirst">
                <Radio label="地址" border></Radio>
                <Radio label="经纬度" border></Radio>
              </RadioGroup>
              <Divider dashed />
              <Select v-model="layerSelect" style="width:200px" placeholder = "请选择分区图层">
                <Option v-for="(item,index) in this.layersget" :value="index" :key="item.layerId">{{ item.layerName+'-'+ index }}</Option>
              </Select>
              <Divider dashed />
              <Button type="primary" ghost @click = "locationPoints">定位</Button>
            </div>
            <div slot="bottom" class="split-pane">
            </div>
        </div>
      </div>
      <div class = "rightsider" :class={active:isActiveStatis} >
        <div class="spin-container"  >
          <Table border :loading="loading" :height="screenHeight/2"  :columns="columnsInput" :data="dataInput" ref="table">
          </Table>
        </div>
        <div>test <i-switch v-model="loading"></i-switch></div>
        <Button type="primary" size="large" @click="exportData(1)"><Icon type="ios-download-outline"></Icon> 导出数据</Button>
      </div>
    </div>
</template>

<script>
/* eslint-disable eqeqeq */

import XLSX from 'xlsx'
import Convertor from '../../../utils/Convertor'
export default {
  props: ['isActiveStatis'],
  name: 'StatisWindow',
  computed: {
    getClientHeight: function () {
      let clientHeight = document.documentElement.clientHeight
      window.onresize = () => {
        clientHeight = document.documentElement.clientHeight
        return clientHeight
      }
      clientHeight = clientHeight - 100
      console.log(clientHeight)
      return clientHeight
    },
    halfClientHeight: function () {
      return this.getClientHeight / 2
    },
    fullWindowPx: function () {
      return this.getClientHeight + 'px'
    }
  },
  data () {
    return {
      columnsInput: [
      ],
      dataInput: [
      ],
      split2: 0.5,
      file: null,
      loadingStatus: false,
      screenHeight: 1000,
      loading: false,
      maptype: '百度',
      laberBaidu: '百度',
      laberWGS: 'WGS84',
      addressCol: '',
      lngCol: '',
      latCol: '',
      locationFirst: '地址',
      layerSelect: '',
      layersget: this.$store.getters.layersget, // 数据分区
      convertor: new Convertor()
    }
  },
  mounted () {
    this.$refs.upload.addEventListener('change', e => { // 绑定监听表格导入事件
      this.readExcel(e)
    })
    this.screenHeight = document.documentElement.clientHeight
    console.log(this.screenHeight)
  },
  methods: {
    readExcel (e) { // 表格导入
      try {
        this.dataInput = []// 清空接收数据
        this.columnsInput = []
        var files = null
        var that = this
        files = e.target.files
        that.loading = true
        var max = files[0].size
        if (max > 1 * 1024 * 1024) {
          this.$Message.error('上传文件不能超过1M')
          that.loading = false
          return
        }
        if (files.length <= 0) { // 如果没有文件名
          return false
        } else if (!/\.(xls|xlsx)$/.test(files[0].name.toLowerCase())) {
          this.$Message.error('上传格式不正确，请上传xls或者xlsx格式')
          that.loading = false
          return false
        }
        const fileReader = new FileReader()
        var ws = []
        fileReader.readAsBinaryString(files[0])
        fileReader.onloadend = (ev) => {
          const data = ev.target.result
          const workbook = XLSX.read(data, {
            type: 'binary'
          })
          const wsname = workbook.SheetNames[0]// 取第一张表
          ws = XLSX.utils.sheet_to_json(workbook.Sheets[wsname])// 生成json表格内容
          console.log(ws)
          const range = XLSX.utils.decode_range(workbook.Sheets[wsname]['!ref'])
          for (let c = range.s.c; c <= range.e.c; c++) {
            const header = XLSX.utils.encode_col(c) + '1'
            var colName = workbook.Sheets[wsname][header].v
            var headCol = {
              title: colName,
              key: colName
              /* width: 100 */
            }
            if (c == 1) {
              headCol['fixed'] = 'left'
            }
            that.columnsInput.push(headCol)
          }
          that.dataInput = ws
          that.loading = false
        }
      } catch (err) {
        that.loading = false
        console.log(err)
      }
    },
    exportData (type) {
      if (type === 1) {
        this.$refs.table.exportCsv({
          filename: 'exportdata_new'
        })
      }
    },
    clearData () {
      this.dataInput = []// 清空接收数据
      this.columnsInput = []
      this.$refs.upload.value = null
      this.loading = false
    },
    locationPoints () {
      if (!this.loading) {
        this.loading = true
        setTimeout(this.locationPointsEx, 500)
      } else {
        this.$Message.error('正在执行')
      }

      // this.locationPointsEx()
    },
    getPointFromAdress (myGeo, layers, address) {
      return new Promise(function (resolve, reject) {
        myGeo.getPoint(address, point => {
          if (point) {
            resolve(point)
          } else {
            resolve(null)
          }
        }, layers.layerDes)
      })
    },
    isRightPoint (point) {
      if (!point || point.lng == 0 || point.lat == 0) {
        return false
      }
      return true
    },
    convertCross (oriPoint) {
      if (this.maptype == this.laberWGS) {
        var r1 = this.convertor.WGS2BD09(oriPoint)
        return r1
      }
      return oriPoint
    },
    getItemPosition (item, index) {
      var that = this
      var layers = this.$store.getters.layersget[this.layerSelect]
      var geometrys = this.$store.getters.geometrysInLayer[layers.layerId] || []
      var myGeo = new window.BMap.Geocoder()
      return new Promise(function (resolve, reject) {
        item['归属区域'] = ''
        // var oriPoint = new window.BMap.Point(item[that.lngCol], item[that.latCol])
        var address = item[that.addressCol]
        // var pointBj09 = that.getPointFromCross(item, index)
        var p2 = that.getPointFromAdress(myGeo, layers, address)
        console.log(item, index)
        p2.then(function (results) {
          var point = that.locationFirst == '经纬度' ? item['经纬度'] : results
          var pointBei = that.locationFirst == '地址' ? results : item['经纬度']
          if (!that.isRightPoint(point)) {
            point = pointBei
          }
          for (var geometry of geometrys) {
            if (geometry.contains(point)) {
              item['归属区域'] = geometry._gridPoly.geometryName || {}
              resolve(item)
              break
            }
          }
          resolve(item)
        }).catch(error => {
          console.log(error)
        })
      })
    },
    locationPointsEx () {
      var that = this
      var hasZone = false
      for (var prop of this.columnsInput) {
        if (prop.title == '归属区域') {
          hasZone = true
          break
        }
      }
      if (!hasZone) {
        var newCol = {
          title: '归属区域',
          key: '归属区域'
          /* width: 100 */
        }
        this.columnsInput.push(newCol)
      }
      for (let index = 0; index < this.dataInput.length; index++) {
        var oriPoint = {lng: this.dataInput[index][this.lngCol], lat: this.dataInput[index][this.latCol]}
        var r1 = this.convertCross(oriPoint)
        this.dataInput[index]['经纬度'] = new window.BMap.Point(r1.lng, r1.lat)
      }
      var promises = this.dataInput.map(that.getItemPosition)
      Promise.all(promises).then((alldata) => {
        console.log(alldata)
        that.dataInput.push(that.dataInput.pop())
        that.loading = false
      })
    }
  }
}
</script>

<style scoped>
  .pstyle{
    font-family:Simsun;
    font-size:10px;
  }
  .select {
    width: 200px;
    color: #555;
  }
  .leftsider{
    width: 230px;
    height: 100%;
    background: #E0E0E0;
    float: left;
    border:2px solid palegreen;
  }
  .leftsider.active{
    width: 0px;
    margin-left: -230px;
  }
   .rightsider{
     margin-left: 230px;
   }
  .rightsider.active{
    margin-left: 0px;
  }
  .split{
   /* height: 1200px;*/
    border: 1px solid #dcdee2;
  }
  .split-pane{
    padding: 10px;
  }
  .uploadbutton{
    display: inline-block;
    background: #D0EEFF;
    border: 1px solid #99D3F5;
    border-radius: 4px;
    padding: 4px 12px;
    float:right;
  }
  .uploadfile {
    position: relative;
    display: inline-block;
    background: #D0EEFF;
    border: 1px solid #99D3F5;
    border-radius: 4px;
    padding: 4px 12px;
    overflow: hidden;
    color: #1E88C7;
    text-decoration: none;
    text-indent: 0;
    line-height: 20px;
  }
  .uploadfile input {
    position: absolute;
    font-size: 100px;
    right: 0;
    top: 0;
    opacity: 0;
  }
  .uploadfile:hover {
    background: #AADFFD;
    border-color: #78C3F3;
    color: #004974;
    text-decoration: none;
  }
  .spin-container{
    width: 100%;
    hight: 300px;
    display: inline-block;
    position: relative;
    border: 1px solid #eee;
  }
</style>
