<template>
  <div class="layout">
    <Layout>
      <Header>
        <Menu mode="horizontal" theme="dark"  active-name="1">
          <div class="layout-logo"></div>
          <div class="layout-nav">
            <MenuItem name="1">
              <Icon type="ios-navigate"></Icon>
              Item 1
            </MenuItem>
            <MenuItem name="2">
              <Icon type="ios-keypad"></Icon>
              Item 2
            </MenuItem>
            <MenuItem name="3">
              <Icon type="ios-analytics"></Icon>
              Item 3
            </MenuItem>
            <MenuItem name="4">
              <Icon type="ios-paper"></Icon>
              Item 4
            </MenuItem>
          </div>
        </Menu>
      </Header>
      <Layout>
        <Sider hide-trigger :style="{background: '#fff'}">
          <user-panel ref = "userpanel"></user-panel>
          <div>
            <Menu width="200px" active-name="1-2" :open-names="['1']">
              <MenuItem name="1" @click.native ="mapWindowAutoLeft">
                <Icon type="ios-paper" />
                图层管理
              </MenuItem>
              <Submenu name="1">
                <template slot="title">
                  <Icon type="ios-paper" />
                  统计分析
                </template>
                <MenuItem name="1-1" @click.native = "handleTest">地址分区</MenuItem>
                <MenuItem name="1-2">评论管理</MenuItem>
                <MenuItem name="1-3">举报管理</MenuItem>
              </Submenu>
              <Submenu name="2">
                <template slot="title">
                  <Icon type="ios-people" />
                  用户管理
                </template>
                <MenuItem name="2-1">新增用户</MenuItem>
                <MenuItem name="2-2" @click.native = "updatePassword">更改密码</MenuItem>
              </Submenu>
            </Menu>
          </div>
        </Sider>
        <Layout :style="{padding: '0 5px 5px'}">
          <Content :style="{padding: '5px', minHeight: '480px', background: '#fff'}">
            <!--<component :is="currentView" keep-alive></component>-->
            <keep-alive>
              <router-view :is-active = "isActive" :is-active-statis = "isActiveStatis"></router-view>
            </keep-alive>
            <!-- 渲染组件 -->
            <!--<MapWindow v-bind:is-active="isActive"></MapWindow>-->
          </Content>
        </Layout>
      </Layout>
    </Layout>
  </div>
</template>
<script>
import MapWindow from './map/MapWindow.vue'
import StatisWindow from './statis/StatisWindow.vue'
import UserPanel from './UserPanel.vue'
export default {
  components: {MapWindow, UserPanel, StatisWindow},
  data: function () {
    return {
      isActive: true,
      isActiveStatis: true,
      currentView: MapWindow
    }
  },
  mounted: function () {
    this.mapWindowAutoLeft()
  },
  methods: {
    mapWindowAutoLeft () {
      this.$router.push({path: '/map'})
      this.isActive = !this.isActive
      /*      this.currentView = MapWindow
      this.isActive = !this.isActive */
    },
    handleTest () {
      this.$router.push({path: '/statis'})
      this.isActiveStatis = !this.isActiveStatis
      /* this.currentView = StatisWindow */
    },
    updatePassword () {
      this.$refs.userpanel.updatePassword()
    }
  }
}
</script>
<style scoped>
  .layout{
    border: 1px solid #d7dde4;
    background: #f5f7f9;
    position: relative;
    border-radius: 4px;
    overflow: hidden;
  }
  .layout-logo{
    width: 100px;
    height: 30px;
    background: #5b6270;
    border-radius: 3px;
    float: left;
    position: relative;
    top: 15px;
    left: 20px;
  }
  .layout-nav{
    width: 420px;
    margin: 0 auto;
    margin-right: 20px;
  }
</style>
