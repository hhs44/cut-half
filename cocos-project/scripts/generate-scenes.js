// 生成 5 个 scene 文件的脚本
// 用法: node generate-scenes.js

const fs = require('fs');
const path = require('path');

const ASSETS_DIR = path.join(__dirname, '..', 'assets');
const SCENES_DIR = path.join(ASSETS_DIR, 'scenes');

const SCENES = [
  { name: 'MenuScene', sceneId: '038e9c2e-211d-46e9-8abf-3d6ad7ea99bc', scriptUuid: '668fac9f-74f7-4889-a271-857160fa2990' },
  { name: 'GameScene', sceneId: '78d51a6a-a4cb-4ee8-825b-32c895e39b44', scriptUuid: '861713da-0154-43b8-b937-d00d85e6a188' },
  { name: 'ResultScene', sceneId: '67e6d0c7-694e-438b-953f-0703b2766dd8', scriptUuid: 'e06f95b1-8eae-4bbd-a3ca-4888db4f3a80' },
  { name: 'FailScene', sceneId: '21c7b7b3-ac58-445a-a304-d845e2661e74', scriptUuid: '5448ae43-5be7-47bf-a708-a8bfc6bd193d' },
  { name: 'GameOverScene', sceneId: '2b069ee5-601f-4a6a-a382-b86ca7cee822', scriptUuid: '58dee231-b70c-4b50-a965-65d785a59efa' },
];

function genId(i) { return `${i}`; }

function generateScene({ name, sceneId, scriptUuid, scriptClassName }) {
  let id = 0;
  const nodes = [];

  // 0: SceneAsset
  nodes.push({
    __type__: 'cc.SceneAsset',
    _name: name,
    _objFlags: 0,
    __editorExtras__: {},
    _native: '',
    scene: { __id__: 1 }
  });
  id = 1;

  // 1: Scene
  const sceneObj = {
    __type__: 'cc.Scene',
    _name: name,
    _objFlags: 0,
    __editorExtras__: {},
    _parent: null,
    _children: [],
    _active: true,
    _components: [],
    _prefab: null,
    _lpos: { __type__: 'cc.Vec3', x: 0, y: 0, z: 0 },
    _lrot: { __type__: 'cc.Quat', x: 0, y: 0, z: 0, w: 1 },
    _lscale: { __type__: 'cc.Vec3', x: 1, y: 1, z: 1 },
    _mobility: 0,
    _layer: 1073741824,
    _euler: { __type__: 'cc.Vec3', x: 0, y: 0, z: 0 },
    autoReleaseAssets: false,
    _globals: { __id__: 2 },
    _id: sceneId
  };
  nodes.push(sceneObj);
  id = 2;

  // 2: SceneGlobals
  const globalsId = id;
  nodes.push({
    __type__: 'cc.SceneGlobals',
    ambient: { __id__: 3 },
    skybox: { __id__: 4 },
    fog: { __id__: 5 },
    octree: { __id__: 6 }
  });
  id = 3;

  // 3-6: AmbientInfo, SkyboxInfo, FogInfo, OctreeInfo
  nodes.push({
    __type__: 'cc.AmbientInfo',
    _skyColorHDR: { __type__: 'cc.Vec4', x: 0.2, y: 0.5, z: 0.8, w: 0.520833 },
    _skyColor: { __type__: 'cc.Vec4', x: 0.2, y: 0.5, z: 0.8, w: 0.520833 },
    _skyIllumHDR: 20000,
    _skyIllum: 20000,
    _groundAlbedoHDR: { __type__: 'cc.Vec4', x: 0.2, y: 0.2, z: 0.2, w: 1 },
    _groundAlbedo: { __type__: 'cc.Vec4', x: 0.2, y: 0.2, z: 0.2, w: 1 },
    _skyColorLDR: { __type__: 'cc.Vec4', x: 0.452588, y: 0.609632, z: 0.764623, w: 0.520833 },
    _skyIllumLDR: 0.8,
    _groundAlbedoLDR: { __type__: 'cc.Vec4', x: 0.2, y: 0.2, z: 0.2, w: 1 }
  });
  id = 4;

  nodes.push({
    __type__: 'cc.SkyboxInfo',
    _envLightingType: 0,
    _envmapHDR: null,
    _envmap: null,
    _envmapLDR: null,
    _diffuseMapHDR: null,
    _diffuseMap: null,
    _enabled: false,
    _useHDR: true,
    _editableMaterial: null,
    _reflectionHDR: null,
    _reflection: null,
    _rotationAngle: 0
  });
  id = 5;

  nodes.push({
    __type__: 'cc.FogInfo',
    _type: 0,
    _fogColor: { __type__: 'cc.Color', r: 200, g: 200, b: 200, a: 255 },
    _enabled: false,
    _fogDensity: 0.3,
    _fogStart: 0.5,
    _fogEnd: 300,
    _fogAtten: 5,
    _fogTop: 1.5,
    _fogRange: 1.2,
    _accurate: false
  });
  id = 6;

  nodes.push({
    __type__: 'cc.OctreeInfo',
    _enabled: false,
    _minPos: { __type__: 'cc.Vec3', x: -1024, y: -1024, z: -1024 },
    _maxPos: { __type__: 'cc.Vec3', x: 1024, y: 1024, z: 1024 },
    _depth: 8
  });
  id = 7;

  // ===== 节点: Canvas (子节点为 Camera 和 UIRoot) =====
  const canvasNodeId = id;
  nodes.push({
    __type__: 'cc.Node',
    _name: 'Canvas',
    _objFlags: 0,
    __editorExtras__: {},
    _parent: { __id__: 1 },
    _children: [{ __id__: id + 3 }, { __id__: id + 6 }], // Camera node id, UIRoot node id
    _active: true,
    _components: [{ __id__: id + 1 }, { __id__: id + 2 }],
    _prefab: null,
    _lpos: { __type__: 'cc.Vec3', x: 0, y: 0, z: 0 },
    _lrot: { __type__: 'cc.Quat', x: 0, y: 0, z: 0, w: 1 },
    _lscale: { __type__: 'cc.Vec3', x: 1, y: 1, z: 1 },
    _mobility: 0,
    _layer: 33554432,
    _euler: { __type__: 'cc.Vec3', x: 0, y: 0, z: 0 },
    _id: `canvas-${sceneId}`
  });
  id++;

  // Canvas 的 UITransform 组件
  nodes.push({
    __type__: 'cc.UITransform',
    _name: '',
    _objFlags: 0,
    __editorExtras__: {},
    node: { __id__: canvasNodeId },
    _enabled: true,
    _components: null,
    _prefab: null,
    __scriptAsset: null,
    _contentSize: { __type__: 'cc.Size', width: 720, height: 1280 },
    _anchorPoint: { __type__: 'cc.Vec2', x: 0.5, y: 0.5 }
  });
  id++;

  // Canvas 的 cc.Canvas 组件
  nodes.push({
    __type__: 'cc.Canvas',
    _name: '',
    _objFlags: 0,
    __editorExtras__: {},
    node: { __id__: canvasNodeId },
    _enabled: true,
    _cameraComponent: { __id__: id + 1 }, // Camera node 的 camera 组件
    _alignCanvasWithScreen: true,
    _fitWidth: true,
    _fitHeight: false
  });
  id++;

  // ===== 节点: Camera (Canvas 的子节点) =====
  const cameraNodeId = id;
  nodes.push({
    __type__: 'cc.Node',
    _name: 'Camera',
    _objFlags: 0,
    __editorExtras__: {},
    _parent: { __id__: canvasNodeId },
    _children: [],
    _active: true,
    _components: [{ __id__: id + 1 }],
    _prefab: null,
    _lpos: { __type__: 'cc.Vec3', x: 0, y: 0, z: 1000 },
    _lrot: { __type__: 'cc.Quat', x: 0, y: 0, z: 0, w: 1 },
    _lscale: { __type__: 'cc.Vec3', x: 1, y: 1, z: 1 },
    _mobility: 0,
    _layer: 1073741824,
    _euler: { __type__: 'cc.Vec3', x: 0, y: 0, z: 0 },
    _id: `camera-${sceneId}`
  });
  id++;

  // Camera 的 cc.Camera 组件
  nodes.push({
    __type__: 'cc.Camera',
    _name: '',
    _objFlags: 0,
    __editorExtras__: {},
    node: { __id__: cameraNodeId },
    _enabled: true,
    _projection: 1, // orthographic
    _priority: 0,
    _fov: 45,
    _fovAxis: 0,
    _orthoHeight: 640,
    _near: 1,
    _far: 2000,
    _color: { __type__: 'cc.Color', r: 51, g: 51, b: 51, a: 255 },
    _depth: 1,
    _stencil: 0,
    _clearFlags: 7,
    _targetTexture: null,
    _visibility: 41943040,
    _cameraType: -1,
    _trackingType: 0,
    _id: `camera-cam-${sceneId}`
  });
  id++;

  // ===== 节点: UIRoot (Canvas 的子节点) - 挂载脚本 =====
  const uiRootNodeId = id;
  nodes.push({
    __type__: 'cc.Node',
    _name: 'UIRoot',
    _objFlags: 0,
    __editorExtras__: {},
    _parent: { __id__: canvasNodeId },
    _children: [],
    _active: true,
    _components: [{ __id__: id + 1 }, { __id__: id + 2 }],
    _prefab: null,
    _lpos: { __type__: 'cc.Vec3', x: 0, y: 0, z: 0 },
    _lrot: { __type__: 'cc.Quat', x: 0, y: 0, z: 0, w: 1 },
    _lscale: { __type__: 'cc.Vec3', x: 1, y: 1, z: 1 },
    _mobility: 0,
    _layer: 33554432,
    _euler: { __type__: 'cc.Vec3', x: 0, y: 0, z: 0 },
    _id: `uiroot-${sceneId}`
  });
  id++;

  // UIRoot 的 UITransform 组件
  nodes.push({
    __type__: 'cc.UITransform',
    _name: '',
    _objFlags: 0,
    __editorExtras__: {},
    node: { __id__: uiRootNodeId },
    _enabled: true,
    _components: null,
    _prefab: null,
    __scriptAsset: null,
    _contentSize: { __type__: 'cc.Size', width: 720, height: 1280 },
    _anchorPoint: { __type__: 'cc.Vec2', x: 0.5, y: 0.5 }
  });
  id++;

  // UIRoot 的自定义脚本组件
  nodes.push({
    __type__: scriptUuid,
    _name: '',
    _objFlags: 0,
    __editorExtras__: {},
    node: { __id__: uiRootNodeId },
    _enabled: true,
    __scriptAsset: { __id__: uiRootNodeId + 1 }
    // 脚本属性由脚本的默认值填充
  });
  id++;

  // 修正 Scene 的 _children
  sceneObj._children = [{ __id__: canvasNodeId }];

  return nodes;
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function main() {
  ensureDir(SCENES_DIR);

  for (const scene of SCENES) {
    const data = generateScene(scene);
    const filePath = path.join(SCENES_DIR, `${scene.name}.scene`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`✅ 生成: ${scene.name}.scene (${data.length} 个对象)`);
  }

  console.log('\n完成! 5 个场景文件已生成');
}

main();
