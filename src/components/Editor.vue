<template>
  <div class="Editor">
    <div
      class="Editor_Viewer"
      ref="Editor_Viewer"
    >
      <Viewer
        :width="viewWidth"
        :height="viewHeight"
        :objects="objects"
        @select="selectObject"
        @input="changeTargetTransform"
      />
    </div>
    <div class="Editor_Input">
      ← WebGL Canvas | ↓DOM
      <InputField
        :addLogo="addLogo"
        :addHamburger="addHamburger"
        :selectedObject="firstSelectedObject"
        @input="changeTargetTransform"
        @delete="deleteTargetObject"
      />
      <hr>
      <pre>{{ objects }}</pre>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex';
import { find, throttle } from 'lodash-es';
import Viewer from './Viewer';
// import Viewer from './Viewer2';
import InputField from './InputField';

export default {
  name: 'Editor',
  data() {
    return {
      viewWidth: 1,
      viewHeight: 1,
    }
  },
  computed: {
    ...mapState( [ 'objects' ] ),
    ...mapGetters( [ 'firstSelectedObject' ] ),
  },
  methods: {
    ...mapActions( [
      'addLogo',
      'addHamburger',
      'selectObject',
      'changeTargetTransform',
      'deleteTargetObject',
    ] ),
    resize() {
      this.viewWidth = this.$refs.Editor_Viewer.clientWidth;
      this.viewHeight = this.$refs.Editor_Viewer.clientHeight;
    },
  },
  mounted() {

    this.resize();
    this.throttledResize = throttle( this.resize.bind( this ) );
    window.addEventListener( 'resize', this.throttledResize );

  },
  beforeDestroy() {

    window.removeEventListener( 'resize', this.throttledResize );

  },
  components: {
    Viewer,
    InputField,
  },
}
</script>

<style scoped lang="scss">
.Editor {
  display: flex;
}
.Editor_Viewer {
  flex-grow: 1;
  height: 100vh;
}
.Editor_Input {
  width: 300px;
}
</style>
