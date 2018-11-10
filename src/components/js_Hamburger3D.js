// <template> や <style> を持たない「コンポーネント」
import * as THREE from 'three'
import { deepDispose } from '../utils/deep-dispose';
import Vue from 'vue';

export default Vue.extend ( {
  name: 'Hamburger3D',
  props: {
    id: Number,
    positionX: Number,
    positionY: Number,
    positionZ: Number,
    material: String,
    // transformControl: Object, // THREE.TransformControls
    selected: Boolean,

    scene: Object, // THREE.Scene
    camera: Object, // THREE.Camera,
    draggableArea: HTMLElement,
  },
  computed: {
    transform() {
      return {
        positionX: this.positionX,
        positionY: this.positionY,
        positionZ: this.positionZ,
      }
    }
  },
  created() {

    // eslint-disable-next-line
    console.log( 'Hamburger3D is mounted!' );

    var loader = new THREE.GLTFLoader();

    this.transformControl = new THREE.TransformControls( this.camera, this.draggableArea );
    this.transformControl.addEventListener( 'change',    this.onControlChange );
    this.transformControl.addEventListener( 'mouseDown', this.onControlChange );
    this.transformControl.addEventListener( 'mouseUp',   this.onControlChange );
    this.transformControl.addEventListener( 'dragging-changed', this.onControlDraggingChanged );

    loader.load(
      './barger.glb',
      ( gltf ) => {

        this.mesh = gltf.scene;
        this.mesh.userData.vuexId = this.id;
        this.mesh.traverse( ( obj ) => obj.userData.vuexId = this.id );
        this.scene.add( this.mesh );
        this.scene.add( this.transformControl );
        this.transformControl.attach( this.mesh );  
        this.$emit( 'changed' );
    
      },
      ( xhr ) => {
        
        // eslint-disable-next-line
        console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
    
      },
    );

    this.$watch( 'selected', () => {

      if ( this.selected ) {
        
        this.transformControl.attach( this.mesh );

      } else {

        this.transformControl.detach();

      }

      this.$emit( 'changed' );

    } );

    this.$watch( 'transform', () => {

      this.mesh.position.set(
        this.transform.positionX,
        this.transform.positionY,
        this.transform.positionZ
      );
      this.$emit( 'changed' );

    } );

  },

  methods: {

    onControlChange() {

      this.$emit( 'input', {
        id: this.id,
        x: this.mesh.position.x,
        y: this.mesh.position.y,
        z: this.mesh.position.z
      } );

    },

    onControlDraggingChanged( event ) {

      if ( event.value ) {
        
        this.$emit( 'startDragging' );

      } else {
        
        this.$emit( 'endDragging' );

      }

    },

  },

  destroyed() {

    this.transformControl.detach();
    this.transformControl.dispose();
    deepDispose( this.mesh );
    this.scene.remove( this.mesh );
    this.$emit( 'changed' );

    // eslint-disable-next-line
    console.log( 'diposed' );

  },

	render() {
    // template がないので、空の render を明示して
    // `Failed to mount component: template or render function not defined.` 
    // を防ぐ

    return null;
	}
} );
