<template>
  <div class="login">
    <div class="from-wrap">
      <h2>登录</h2>
      <Form ref="loginData" :model="loginData" :rules="ruleValidate" :label-width="80">
        <FormItem label="帐号" prop="acct">
          <Input type="text" v-model="loginData.acct" placeholder="请输入账号"/>
        </FormItem>
        <FormItem label="密码" prop="pass">
          <Input type="password" v-model="loginData.pass" placeholder="请输入密码"/>
        </FormItem>
        <FormItem class = "form-footer">
          <Button type="primary"   @click="handleSubmit('loginData')">登陆</Button>
          <Button type="ghost"  @click="handleReset('loginData')" >重置</Button>
          <Button type="primary" ghost @click="handleAddUser">注册</Button>
        </FormItem>
      </Form>
    </div>
  </div>
</template>
<script>
export default {
  data () {
    return {
      loginData: {
        acct: '',
        pass: ''
      },
      ruleValidate: {
        acct: [
          { required: true, message: '账号不能为空', trigger: 'blur' },
          { min: 3, max: 16, message: '账号长度3-16个字符', trigger: 'blur' }
        ],
        pass: [
          { required: true, message: '密码不能为空', trigger: 'blur' },
          { type: 'string', min: 3, max: 16, message: '密码长度6-16个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    handleSubmit (name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          this.login()
        } else {
          this.$Message.error('表单验证失败!')
        }
      })
    },
    handleReset (name) {
      this.$refs[name].resetFields()
    },
    handleAddUser () {
      console.log('注册用户')
      this.$router.push('/register')
    },
    login () {
      console.log(this.loginData.acct, this.loginData.pass)
      var that = this
      this.axios({
        method: 'post',
        url: '/api/login',
        data: {
          username: this.loginData.acct,
          password: this.loginData.pass
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
            // this.$store.commit('SET_TOKEN', response.data.token)
            // this.$store.commit('GET_USER', response.data.user)
            /*            this.$message({
              message: '登陆成功',
              type: 'success'
            }) */
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
<style>
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
    width: 400px;
    height: 240px;
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
