import Vue from 'vue';
import Vuex from 'vuex';
import { find, cloneDeep } from 'lodash-es';

let count = 1;

Vue.use( Vuex )

export default new Vuex.Store( {
  state: {
    objects: [],
  },
  getters: {
    firstSelectedObject( state ) {

      return find( state.objects, ( object ) => object.selected );

    }
  },
  mutations: {
    updateObjects( state, newObject ) {

      state.objects = newObject;

    },
  },
  actions: {
    addLogo( { commit, state } ) {

      const clonedObjects = cloneDeep( state.objects );
      clonedObjects.forEach( ( object ) => object.selected = false );
      const newObject = {
        type: 'logo',
        id: count ++,
        positionX: 0,
        positionY: 0,
        positionZ: 0,
        material: 'default',
        selected: true,
      };
      clonedObjects.push( newObject );
      commit( 'updateObjects', clonedObjects );

    },
    addHamburger( { commit, state } ) {

      const clonedObjects = cloneDeep( state.objects );
      clonedObjects.forEach( ( object ) => object.selected = false );
      const newObject = {
        type: 'hamburger',
        id: count ++,
        positionX: 0,
        positionY: 0,
        positionZ: 0,
        material: 'default',
        selected: true,
      };
      clonedObjects.push( newObject );
      commit( 'updateObjects', clonedObjects );

    },
    selectObject( { commit, state }, id ) {

      const clonedObjects = cloneDeep( state.objects );
      clonedObjects.forEach( ( object ) => {

        const selected = object.id === id;
        object.selected = selected;

      } );
      commit( 'updateObjects', clonedObjects );

    },
    changeTargetTransform( { commit, state }, { id, x, y, z } ) {

      const clonedObjects = cloneDeep( state.objects );
      clonedObjects.forEach( ( object ) => {

        if ( object.id !== id ) return;
        object.positionX = x;
        object.positionY = y;
        object.positionZ = z;

      } );
      commit( 'updateObjects', clonedObjects );

    },
    deleteTargetObject( { commit, state }, id ) {

      const clonedObjects = cloneDeep( state.objects );
      const filtered = clonedObjects.filter( ( object ) => object.id !== id );
      
      commit( 'updateObjects', filtered );


    }
  },
} );
