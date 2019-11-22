<template>
  <div class="login">
    <div class="from-wrap">
      <h2>注册账号</h2>
      <Form ref="rigisterData" :model="rigisterData" :rules="ruleValidate" :label-width="80">
        <FormItem label="帐号" prop="acct">
          <Input type="text" v-model="rigisterData.acct" placeholder="请输入账号"/>
        </FormItem>
        <FormItem label="密码" prop="pass">
          <Input type="password" v-model="rigisterData.pass" placeholder="请输入密码"/>
        </FormItem>
        <FormItem label="重复密码" prop="passTwo">
          <Input type="password" v-model="rigisterData.passTwo" placeholder="请再次输入密码"/>
        </FormItem>
        <FormItem class = "form-footer">
          <Button type="primary"   @click="handleSubmit('rigisterData')">提交</Button>
          <Button type="ghost"  @click="handleReset('rigisterData')" >重置</Button>
        </FormItem>
      </Form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Register',
  data () {
    return {
      rigisterData: {
        acct: '',
        pass: '',
        passTwo: ''
      },
      ruleValidate: {
        acct: [
          { required: true, message: '账号不能为空', trigger: 'blur' },
          { min: 3, max: 16, message: '账号长度3-16个字符', trigger: 'blur' }
        ],
        pass: [
          { required: true, message: '密码不能为空', trigger: 'blur' },
          { type: 'string', min: 3, max: 16, message: '密码长度6-16个字符', trigger: 'blur' }
        ],
        passTwo: [
          {validator: this.samePass, trigger: 'blur'}
        ]
      }
    }
  },
  methods: {
    handleSubmit (name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          this.rigister()
        } else {
          this.$Message.error('表单验证失败!')
        }
      })
    },
    samePass (rule, value, callback) {
      console.log(value)
      console.log(this.rigisterData.pass)
      if (value !== this.rigisterData.pass) {
        callback(new Error('两次密码不一致'))
      } else {
        callback()
      }
    },
    handleReset (name) {
      this.$refs[name].resetFields()
    },
    rigister () {
      console.log(this.rigisterData.acct, this.rigisterData.pass)
      var that = this
      this.axios({
        method: 'post',
        url: '/api/register',
        data: {
          username: this.rigisterData.acct,
          password: this.rigisterData.pass
        },
        transformRequest: [function (data) { // 登录时处理数据格式,处理后后台接收的参数为data按顺序传递
          let ret = ''
          for (let it in data) {
            ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
          }
          return ret
        }]
      })
        .then((response) => {
          if (response.status === 200) {
            that.$router.push('/index')
          }
        })
        .catch(function (error) {
          console.log(error)
        })
    }
  }
}
</script>

<style scoped>
  html,body {
    width: 100%;
    height: 100%;
    background-color: #1c2438;
  }
  .login {
    width: 100%;
    height: 100%;
    background-color: #1c2438;
    position: relative;
  }
  .login .from-wrap{
    position: fixed;
    left: 50%;
    margin-left: -200px;
    top: 50%;
    margin-top: -150px;
    width: 500px;
    height: 300px;
    border-radius: 10px;
    background-color: #fff;
    padding: 20px 30px;
  }
  .login h2 {
    text-align: center;
    margin-bottom: 20px;
  }
  .login formItem {
    margin-bottom: 15px;
  }
  .login .form-footer {
    text-align: right
  }
  .ivu-form-item-required .ivu-form-item-label:before {
    display: none
  }
</style>
