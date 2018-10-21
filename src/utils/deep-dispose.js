export function deepDispose( object3D ) {

	object3D.traverse( _object3D => dispose( _object3D ) );

}

function dispose( object3D ) {

	if ( !! object3D.geometry ) {

		object3D.geometry.dispose();
		object3D.geometry = undefined;

	}

	if ( !! object3D.material && Array.isArray( object3D.material ) ) {

		object3D.material.forEach( material => disposeMaterial( material ) );

	} else if ( !! object3D.material ) {

		disposeMaterial( object3D.material );

	}

}

function disposeMaterial( material ) {

	if ( !! material.map ) {

		material.map.dispose();
		material.map = undefined;

	}

	if ( !! material.normalMap ) {

		material.normalMap.dispose();
		material.normalMap = undefined;

	}

	if ( !! material.specularMap ) {

		material.specularMap.dispose();
		material.specularMap = undefined;

	}

	if ( !! material.bumpMap ) {

		material.bumpMap.dispose();
		material.bumpMap = undefined;

	}

	material.dispose();
	material = undefined;

}
