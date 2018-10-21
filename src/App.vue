<template>
  <div id="app">
    show: <input type="checkbox" v-model="show"/>
    <template v-if="show">
      <Editor/>
    </template>
  </div>
</template>

<script>
import Editor from './components/Editor'

export default {
  name: 'app',
  data() {
    return {
      show: true,
    };
  },
  components: {
    Editor,
  }
}
</script>

<style lang="scss">
body {
  margin: 0;
}
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #fff;
  background: linear-gradient(to bottom, #485563, #29323c);

}
</style>
