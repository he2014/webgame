<template>
  <Layout style="height: 100%">
    <Sider hide-trigger>
      <leftMenu></leftMenu>
    </Sider>
    <Layout>
<!--      <Header>Header</Header>-->
      <Content>Content</Content>
<!--      <Footer>Footer</Footer>-->
    </Layout>
  </Layout>
</template>

<script>
import leftMenu from '@/components/leftMenu/index'
export default {
  name: 'home',
  components: {
    leftMenu
  }
}
</script>

<style scoped>

</style>
