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
                选择文件中必须有｛经度、纬度｝或｛X、Y｝或｛lng、lat｝,列数不超过10行，不超过1M
              </p>
              <Progress :percent="uploadProgress" v-if="progressFlag" :stroke-color="['#108ee9', '#87d068']" />
            </div>
            <div slot="bottom" class="split-pane">
              <Spin size="large" fix v-if="spinShow"></Spin>
            </div>
          </Split>
        </div>
      </div>
      <div class = "rightsider" :class={active:isActiveStatis}>
        <div class="spin-container"  >
          <Table  :height="screenHeight/2"  :columns="columnsInput" :data="dataInput">

          </Table>
          <Spin size="large" fix v-if="spinShow"></Spin>
          <!--<Spin size="large" fix v-if="spinShow"></Spin>-->
        </div>
        <div :style="{'height':halfClientHeight }">
        </div>
        <!--<Spin size="large" fix v-if="spinShow"></Spin>-->
      </div>
    </div>
</template>

<script>
/* eslint-disable eqeqeq */

import XLSX from 'xlsx'

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
      uploadProgress: 0,
      progressFlag: false,
      spinShow: false
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
    handleUpload (file) {
      this.file = file
      console.log(file)
      return false
    },
    handleSuccess () {
      console.log('success')
    },
    handleFormatError () {
      console.log('handleFormatError')
    },
    handleMaxSize () {
      console.log('handleMaxSize')
    },
    handleBeforeUpload () {
      console.log('handleBeforeUpload')
    },
    readExcel (e) { // 表格导入
      this.dataInput = []// 清空接收数据
      this.columnsInput = []
      var that = this
      const files = e.target.files
      var max = files[0].size
      if (max > 1 * 1024 * 1024) {
        this.$Message.error('上传文件不能超过2M')
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
      fileReader.onloadstart = (ev) => {
        console.log(`${ev.type}: ${ev.loaded} bytes transferred\n`)
        that.progressFlag = true
        that.uploadProgress = 0
        that.spinShow = true
      }
      fileReader.onprogress = function (evt) {
        that.uploadProgress = evt.loaded / max * 100
        console.log(`${evt.type}: ${evt.loaded} bytes transferred\n`)
        if (event.type === 'load') {
          evt.src = fileReader.result
        }
      }
      fileReader.onloadend = (ev) => {
        console.log(`${ev.type}: ${ev.loaded} bytes transferred\n`)
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
        that.progressFlag = false
        console.log('progressFlag', that.progressFlag)
        that.dataInput = ws
        that.spinShow = false
        console.log(that.spinShow)
        // that.dataInput = ws
      }
    }
  }
}
</script>

<style scoped>
  .pstyle{
    font-family:Simsun;
    font-size:10px;
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
    height: 400px;
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
