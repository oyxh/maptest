<template>
    <div :style="{'height':fullWindowPx }">
      <div class="leftsider" :class={active:isActiveStatis} >
        <div class="split">
          <Split v-model="split2" mode="vertical">
            <div slot="top" class="split-pane ">
              <a href="javascript:;" class="uploadfile">选择文件
                <input type="file" ref="upload" accept=".xls,.xlsx"  name="" id="">
              </a>
            </div>
            <div slot="bottom" class="split-pane">
            </div>
          </Split>
        </div>
      </div>
      <div>
        <div >
          <Table  :height="screenHeight/2"  :columns="columnsInput" :data="dataInput">
          </Table>
        </div>
        <div :style="{'height':halfClientHeight }">
        </div>
      </div>
    </div>
</template>

<script>
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
      screenHeight: 1000
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
      console.log(files)
      if (files.length <= 0) { // 如果没有文件名
        return false
      } else if (!/\.(xls|xlsx)$/.test(files[0].name.toLowerCase())) {
        this.$Message.error('上传格式不正确，请上传xls或者xlsx格式')
        return false
      }

      const fileReader = new FileReader()
      fileReader.onload = (ev) => {
        try {
          const data = ev.target.result
          const workbook = XLSX.read(data, {
            type: 'binary'
          })
          const wsname = workbook.SheetNames[0]// 取第一张表
          const ws = XLSX.utils.sheet_to_json(workbook.Sheets[wsname])// 生成json表格内容
          const range = XLSX.utils.decode_range(workbook.Sheets[wsname]['!ref'])
          for (let c = range.s.c; c <= range.e.c; c++) {
            const header = XLSX.utils.encode_col(c) + '1'
            console.log(header)
            console.log(workbook.Sheets[wsname][header].v)
            var colName = workbook.Sheets[wsname][header].v
            var headCol = {
              title: colName,
              key: colName
            }
            that.columnsInput.push(headCol)
            /* ws[header].v = titles[ ws[header].v ] */
          }
          for (var i = 0; i < ws.length; i++) {
            that.dataInput.push(ws[i])
          }
          // this.$refs.upload.value = ''
        } catch (e) {
          return false
        }
      }
      fileReader.readAsBinaryString(files[0])
    }
  }
}
</script>

<style scoped>
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
</style>
