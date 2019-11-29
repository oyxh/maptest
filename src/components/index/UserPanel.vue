<template>
    <div id="userpanel">
        <div class="circlepicture">
          <img src="../../assets/img/user02.png" alt="">
        </div>
        <div class="usertext">
          <Icon type="ios-contact" />{{user.name}}
        </div>
        <a href="javascript:;" class="userlink" @click="editUser"> <Icon type="ios-settings" />账号设置</a>
    </div>
</template>

<script>
export default {
  name: 'UserPanel',
  data: function () {
    return {
      user: {name: '匿名用户'},
      password: '',
      updateUserDom: null,
      formValidate: {
        name: 'oyxh',
        email: ''
      },
      ruleValidate: {
        name: [
          { required: true, message: 'The name cannot be empty', trigger: 'blur' }
        ],
        email: [
          { type: 'email', message: 'Incorrect email format', trigger: 'blur' }
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
  mounted: function () {
    // GET /someUrl
    var that = this
    this.axios({
      method: 'get',
      url: 'api/user'
    }).then(response => {
      console.log(response)
      // that.name = response.data.name
      that.user = response.data
    }, response => {
      console.log('error')
    })
  },
  methods: {
    editUser: function () {
      var that = this
      that.value = ''
      this.$Modal.confirm({
        title: '更新用户内容：',
        render: (h) => {
          var showItem = [
            {
              label: '帐号',
              prop: 'username',
              editFlag: true
            },
            {
              label: '姓名',
              prop: 'name',
              editFlag: false
            },
            {
              label: '邮件',
              prop: 'email',
              editFlag: false
            },
            {
              label: '电话',
              prop: 'mobile',
              editFlag: false
            }
          ]
          const inputs = showItem.map((item) => {
            return h('FormItem', {
              props: {label: item.label,
                prop: item.prop}
            }, [h('Input', { props: {
              autofocus: true,
              readonly: item.editFlag,
              value: that.user[item.prop],
              placeholder: '请输入' + item.label + '...'
            },
            on: {
              input: (val) => {
                that.user[item.prop] = val
              }
            }})])
          })
          var returnCom = h('Form', {
            props: {
              labelWidth: 80,
              rules: that.ruleValidate,
              model: that.user
            },
            methods: {
              // validate: that.updateValidate
            }
          }, inputs)
          that.updateUserDom = returnCom
          return returnCom
        },
        onOk: function () {
          console.log(this)
          console.log(this.title)
          console.log(this.$children[0].$children[0].validate())
          console.log(that.user)
          console.log(that.$refs['updateUser'])
          console.log(that.updateUserDom)
          // console.log(that.updateUserDom.validate())

          that.updateUser(that.user)
        }
      })
    },
    updateUser: function (user) {
      var postconfig = {
        method: 'post',
        url: 'api/saveuser',
        dataType: 'json',
        data: user,
        contentType: 'application/json'
      }
      this.axios(postconfig)
        .then(
          function (response) {
            console.log(response)
          })
        .catch(function (error) {
          console.log(error)
        }) // axios
    },
    updatePassword: function () {
      console.log('update password')
      var that = this
      var password = ''
      var passwordTwo = ''
      this.$Modal.confirm({
        title: '更新密码：',
        render: (h) => {
          var passInput = h('FormItem', {
            props: {label: '输入密码',
              prop: 'pass'}
          }, [h('Input', { props: {
            autofocus: true,
            value: '1111',
            placeholder: '请输入密码...'
          },
          on: {
            input: (val) => {
              password = val
              that.password = val
            }
          }})])
          var passInputConfirm = h('FormItem', {
            props: {label: '确认密码',
              prop: 'passTwo'}
          }, [h('Input', {
            props: {
              autofocus: true,
              value: '2222',
              placeholder: '请再次输入密码...'
            },
            on: {
              input: (val) => {
                passwordTwo = val
                // that.user[item.prop] = val
              }
            }
          })])
          return h('Form', {
            props: {
              labelWidth: 120,
              rules: that.ruleValidate,
              model: that.user
            }
          }, [passInput, passInputConfirm])
        },
        onOk: function () {
          console.log(that.user)
          console.log(password)
          console.log(passwordTwo)
          // that.updateUser(that.user)
        }
      })
    },
    samePass (rule, value, callback) {
      console.log(value)
      console.log(this.password)
      if (value !== this.password) {
        callback(new Error('两次密码不一致'))
      } else {
        callback()
      }
    },
    updateValidate: function (valid) {
      console.log('validate')
    }
  }
}
</script>

<style scoped>
  #userpanel{
    padding: 32px;
    padding-top: 28px;
    padding-bottom: 10px;
  }
  .circlepicture{
    border-radius: 50%;
    width: 90px;
    height: 90px;
    margin: auto;
    margin-bottom: 10px;
    overflow: hidden;
  }
  .usertext{
    display: block;
    color: #2ecf7c;
    font-size: 14px;
    margin-left: 23px;
    text-align: left;
  }
  .userlink{
    color: #6d787c;
    font-size: 14px;
    margin-left: 23px;
    margin-top: 5px;
    text-align: left;
    display: block;
  }
</style>
