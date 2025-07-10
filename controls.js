import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export const initControls = (camera, canvas) => {
    const controls = new OrbitControls(camera, canvas);
    controls.update();
    return controls;
};
