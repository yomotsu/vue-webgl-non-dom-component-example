<template>
  <div class="InputField">
    <button
      type="button"
      @click="addLogo"
    >
      Add Logo
    </button>
    <button
      type="button"
      @click="addHamburger"
    >
      Add Hamburger
    </button>
    <hr/>
    <h2>selected</h2>
    <button
      type="button"
      @click="() => this.$emit( 'delete', selectedObject && selectedObject.id )"
    >
      delete
    </button>
    <br>
    id: {{ selectedObject && selectedObject.id }}<br>
    x
    <input
      type="number"
      step="0.01"
      :disabled="! inputActive"
      v-model.number="x"
      @input="onChange"
    ><br>
    y
    <input
      type="number"
      step="0.01"
      :disabled="! inputActive"
      v-model.number="y"
      @input="onChange"
    ><br>
    z
    <input
      type="number"
      step="0.01"
      :disabled="! inputActive"
      v-model.number="z"
      @input="onChange"
    >
  </div>
</template>

<script>

export default {
  name: 'InputField',
  data() {
    return {
      x: 0,
      y: 0,
      z: 0,
    };
  },
  props: {
    addLogo: Function,
    addHamburger: Function,
    selectedObject: Object,
  },
  computed: {
    inputActive() {
      return !! this.selectedObject;
    }
  },
  watch: {
    selectedObject: {
      handler( newValue ) {
        
        this.x = this.selectedObject ? this.selectedObject.positionX : 0;
        this.y = this.selectedObject ? this.selectedObject.positionY : 0;
        this.z = this.selectedObject ? this.selectedObject.positionZ : 0;

      },
      immediate: true,
    }
  },
  methods: {
    onChange() {
      this.$emit( 'input', {
        id: this.selectedObject.id,
        x: this.x || 0,
        y: this.y || 0,
        z: this.z || 0
      } );
    },
  },
}
</script>

<style scoped lang="scss">
.Editor{
  display: flex;
}
.Editor_Viewer{
  width: 50%;
  height: 100vh;
}
</style>
