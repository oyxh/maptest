<template>
    <div :style="{'height':fullWindowPx }">
      <div class="leftsider" :class={active:isActiveStatis} >
        <div class="split">
          <Split v-model="split2" mode="vertical">
            <div slot="top" class="split-pane ">
              <a href="javascript:;" class="uploadfile">选择文件
                <input type="file" ref="upload" accept=".xls,.xlsx"  name="" id="">
              </a>
              <p class="pstyle" >
                <!--选择文件中必须有｛经度、纬度｝或｛X、Y｝或｛lng、lat｝,列数不超过10行，不超过1M-->
                如果导入数据中有经纬度，请选择坐标
              </p>
              <RadioGroup v-model="maptype">
                <Radio label="百度" border></Radio>
                <Radio label="WGS82" border></Radio>
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
              <Button type="primary" ghost @click = "locationPoints">定位</Button>
            </div>
            <div slot="bottom" class="split-pane">
            </div>
          </Split>
        </div>
      </div>
      <div class = "rightsider" :class={active:isActiveStatis}>
        <div class="spin-container"  >
          <Table  :loading="loading" :height="screenHeight/2"  :columns="columnsInput" :data="dataInput">
          </Table>
        </div>
        <div>test <i-switch v-model="loading"></i-switch></div>
      </div>
    </div>
</template>

<script>
/* eslint-disable eqeqeq */

import XLSX from 'xlsx'
import LayerItems from '../map/LayerItems.vue'
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
      addressCol: '',
      lngCol: '',
      latCol: '',
      locationFirst: '地址'
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
        var that = this
        const files = e.target.files
        that.loading = true
        console.log(files)
        var max = files[0].size
        if (max > 1 * 1024 * 1024) {
          this.$Message.error('上传文件不能超过1M')
          return
        }
        if (files.length <= 0) { // 如果没有文件名
          return false
        } else if (!/\.(xls|xlsx)$/.test(files[0].name.toLowerCase())) {
          this.$Message.error('上传格式不正确，请上传xls或者xlsx格式')
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
          console.log(wsname)
          ws = XLSX.utils.sheet_to_json(workbook.Sheets[wsname])// 生成json表格内容
          console.log(ws)
          const range = XLSX.utils.decode_range(workbook.Sheets[wsname]['!ref'])
          console.log(range)
          console.log(workbook.Sheets[wsname])
          for (let c = range.s.c; c <= range.e.c; c++) {
            const header = XLSX.utils.encode_col(c) + '1'
            console.log(header)
            var colName = workbook.Sheets[wsname][header].v
            var headCol = {
              title: colName,
              key: colName,
              width: 100
            }
            if (c == 1) {
              headCol['fixed'] = 'left'
            }
            that.columnsInput.push(headCol)
          }
          that.dataInput = ws
          that.loading = false
          console.log(that.loading)
        }
      } catch (err) {
        console.log(err)
      }
    },
    locationPoints () {
      console.log(LayerItems)
      console.log(this.$store.getters.geometrysInLayer)
      // this.$store.commit('geometrysInLayerAdd', 12)
      console.log(this.$store.getters.geometrysInLayer)
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
    height: 1200px;
    border: 1px solid #dcdee2;
  }
  .split-pane{
    padding: 10px;
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
