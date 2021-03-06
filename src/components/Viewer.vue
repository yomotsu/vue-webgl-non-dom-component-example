<template>
  <canvas
    :width="width"
    :height="height"
    @click="rayPick"
  >
    {{ /* props にmouted後に得られる情報があるので、 renderReady でそれを監視 */ }}
    <template v-if="renderReady">
      <template v-for="object in objects">
        <template v-if="object.type==='logo'">
          {{ /* 必ず一意のkeyを入れる */ }}
          <Logo3D
            :key="object.id"
            :id="object.id"
            :material="object.material"
            :positionX="object.positionX"
            :positionY="object.positionY"
            :positionZ="object.positionZ"
            :selected="object.selected"
            :scene="scene"
            :camera="camera"
            :draggableArea="renderer.domElement"

            @changed="glRender"
            @input="onTargetChange"
            @startDragging="disableCameraControls"
            @endDragging="enableCameraControls"
          />
        </template>
        <template v-if="object.type==='hamburger'">
          {{ /* 必ず一意のkeyを入れる */ }}
          <Hamburger3D
            :key="object.id"
            :id="object.id"
            :material="object.material"
            :positionX="object.positionX"
            :positionY="object.positionY"
            :positionZ="object.positionZ"
            :selected="object.selected"
            :scene="scene"
            :camera="camera"
            :draggableArea="renderer.domElement"

            @changed="glRender"
            @input="onTargetChange"
            @startDragging="disableCameraControls"
            @endDragging="enableCameraControls"
          />
        </template>
      </template>
    </template>
  </canvas>
</template>

<script>
import * as THREE from 'three';
import { find, differenceWith } from 'lodash-es';
import Logo3D from './Logo3D';
import Hamburger3D from './Hamburger3D';

const _v2 = new THREE.Vector2();

export default {
  name: 'Viewer',
  data() {
    return {
      renderReady: false,
    };
  },
  props: {
    width: Number,
    height: Number,
    objects: Array,
  },
  computed: {
    dimension() {
      return {
        width: this.width,
        height: this.height,
      }
    },
  },
  mounted() {

    this.glRender = this.glRender.bind( this );

    this.renderer = new THREE.WebGLRenderer( {
      canvas: this.$el,
      stencil: false,
      alpha: true,
    } );
    this.renderer.setClearColor( 0x000000, 0 );
    this.renderer.setSize( this.width, this.height );
    this.renderer.setPixelRatio( window.devicePixelRatio || 1 );
    this.renderer.gammaOutput = true;

    this.scene  = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera( 60, this.width / this.height, 0.001, 100 );
    this.camera.position.set( 0, 0, 3 );

    this.cameraControls = new THREE.OrbitControls( this.camera, this.$el );
    this.cameraControls.enableKeys = false;
    this.cameraControls.addEventListener( 'change', this.glRender );

    this.raycaster = new THREE.Raycaster();

    this.scene.add(
      new THREE.HemisphereLight( 0x443333, 0x332222 ),
      new THREE.AmbientLight( 0xcccccc )
    );

    this.gridHelper = new THREE.GridHelper( 10, 10 );
    this.scene.add( this.gridHelper );

    this.renderReady = true;

    // 横と縦が同時に変化したことを検知しても、1箇所の変化として受け取る
    // 個別にwatchすると、watchが2回走ってしまう
    this.$watch( 'dimension', () => {

      this.camera.aspect = this.width / this.height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize( this.width, this.height );
      this.glRender();

    } );

  },

  methods: {

    rayPick( event ) {

      // this.raycaster
      const cursorPosition = _v2;
      cursorPosition.set(
          ( event.clientX / this.$el.clientWidth  ) * 2 - 1,
        - ( event.clientY / this.$el.clientHeight ) * 2 + 1
      );

      this.raycaster.setFromCamera( cursorPosition, this.camera );
      // Meshのみを集める。（SceneやObject3Dは、rayを弾くため）
      const intersectTargets = this.scene.children.reduce( ( accumulator, obj ) => {

        if ( ! obj.userData.vuexId ) return accumulator;
        obj.traverse( ( obj ) => {

          if ( obj.type === 'Mesh' || obj.type === 'SkinnedMesh' ) accumulator.push( obj );

        } );
        return accumulator;

      }, [] );
      
      const intersects = this.raycaster.intersectObjects( intersectTargets );
      if ( ! intersects[ 0 ] ) return;
      
      const id = intersects[ 0 ].object.userData.vuexId;
      this.$emit( 'select', id );

    },

    onTargetChange( { id, x, y, z } ) {

      this.$emit( 'input', { id, x, y, z } )

    },

    disableCameraControls() {

      this.cameraControls.enabled = false;
      
    },

    enableCameraControls() {

      this.cameraControls.enabled = true;
      
    },

    glRender() {

      // 再描画が要求された場合、即座にレンダリングはせず、
      // ** 次回 **の rAF でレンダリングする
      // これは、WebGLにおける、CPU -> GPU のアップロードが非同期のため。

      // 次回の rAF のタイミングで **1度だけ** 再レンダリングする
      // すでにレンダリング予約されていたら、なにもしない
      if ( this.willRender ) return;

      this.willRender = true;

      requestAnimationFrame( () => {

        // destry された直前に描画予約されていたら、それは無視する
        if ( ! this.renderer ) return;
  
        this.renderer.render( this.scene, this.camera );
        delete this.willRender; // レンダリングが完了したら予約解除
      } );

    }

  },

  destroyed() {
    
    this.renderer.dispose();
    this.renderer.forceContextLoss();
    this.renderer.domElement.width = 1;
    this.renderer.domElement.height = 1;
    
    this.renderer.context = undefined;
    this.renderer.domElement = undefined;
    this.renderer = undefined;
    this.cameraControls.dispose();

  },

  components: {
    Logo3D,
    Hamburger3D,
  }
}
</script>

<style scoped lang="scss">
canvas {
  display: block;
}
</style>
