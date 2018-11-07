<template>
  <canvas
    :width="width"
    :height="height"
    @click="rayPick"
  >
  <X/>
  </canvas>
</template>

<script>
import * as THREE from 'three';
import { find, differenceWith } from 'lodash-es';
import Logo3D from './Logo3D';
import X from './X';
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

    this.$watch( 'objects', ( newObjects, oldObjects ) => {

      // ストアにあるのに、シーンになかったら追加
      const addDiff = ! oldObjects ?
        newObjects : 
        differenceWith( newObjects, oldObjects, ( newO, oldO ) => newO.id === oldO.id );
      addDiff.forEach( ( addedObject ) => this.addChild( addedObject ) );

      // ストアにないのに、シーンにあったら削除
      const removeDiff = ! oldObjects ?
        [] : 
        differenceWith( oldObjects, newObjects, ( oldO, newO ) => oldO.id === newO.id );

      removeDiff.forEach( ( removedObject ) => this.removeChild( removedObject ) );

      // props を流し込む（手動で同期）
      newObjects.forEach( ( objects ) => {

        const vm = find( this.$children, ( child ) => child.id === objects.id );
        vm.$props.material  = objects.material;
        vm.$props.positionX = objects.positionX;
        vm.$props.positionY = objects.positionY;
        vm.$props.positionZ = objects.positionZ;
        vm.$props.selected  = objects.selected;

      } );

    }, {
      immediate: true
    } );

  },

  methods: {

    addChild( object ) {

      const DisplayObject3d = object.type === 'hamburger' ? Hamburger3D : Logo3D;

      // 手動でマウントする
      const Displayobject3D = new DisplayObject3d( {
        // store: this.$store,
        // 一応、dataも渡せるけれど...
        // data: {
        //   data0: true
        // },
        // propsは`propsData`として渡す
        // https://github.com/vuejs/vue/blob/b8d33ecd9ab8b7a46d8558b4e2caf506235cd165/src/core/instance/init.js#L84
        propsData: {
          id: object.id,
          positionX: object.positionX,
          positionY: object.positionY,
          positionZ: object.positionZ,
          material: object.material,
          selected: false,

          scene: this.scene,
          camera: this.camera,
          draggableArea: this.renderer.domElement,
        }
      } );

      // イベントのバインド。template で書くなら @change="glRender"
      Displayobject3D.$on( 'changed', () => {
        this.glRender();
      } );

      Displayobject3D.$on( 'input', ( { id, x, y, z} ) => {

        this.$emit( 'input', { id, x, y, z } );

      } );

      Displayobject3D.$on( 'startDragging', () => {

        this.cameraControls.enabled = false;

      } );

      Displayobject3D.$on( 'endDragging', () => {

        this.cameraControls.enabled = true;

      } );

      Displayobject3D.$on( 'delete', () => {

        Displayobject3D.$destroy();

      } );

      // VueDevTools にも反映される
      this.$children.push( Displayobject3D );
      // インスタンス内で mounted が発火する
      Displayobject3D.$mount();

    },

    removeChild( object ) {

      // シーンからの削除処理
      const index = this.$children.findIndex( ( child ) => child.id === object.id );
      const Displayobject3D = this.$children[ index ];
      this.$children.splice( index, 1 );
      Displayobject3D.$destroy();

    },

    rayPick( event ) {

      // this.raycaster
      const cursorPosition = _v2;
      cursorPosition.set(
          ( event.clientX / this.$el.clientWidth  ) * 2 - 1,
        - ( event.clientY / this.$el.clientHeight ) * 2 + 1
      );

      this.raycaster.setFromCamera( cursorPosition, this.camera );
      // Meshのみを集める。（SceneやDisplayObject3Dは、rayを弾くため）
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
    X,
  }
}
</script>

<style scoped lang="scss">
canvas {
  display: block;
}
</style>
