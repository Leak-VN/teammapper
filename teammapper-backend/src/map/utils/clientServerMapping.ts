import { MmpMap } from '../entities/mmpMap.entity';
import { MmpNode } from '../entities/mmpNode.entity';
import { IMmpClientMap, IMmpClientNode, IMmpClientNodeBasics } from '../types';

const DEFAULT_COLOR_NAME = '#787878';
const DEFAULT_COLOR_BACKGROUND = '#f0f6f5';
const DEFAULT_FONT_SIZE = 20;
const DEFAULT_FONT_STYLE = 'normal';
const DEFAULT_FONT_WEIGHT = 'normal';
const DEFAULT_NAME = 'Root node';

const mapMmpNodeToClient = (serverNode: MmpNode): IMmpClientNode => ({
  colors: {
    name: serverNode.colorsName || '',
    background: serverNode.colorsBackground || '',
    branch: serverNode.colorsBranch || '',
  },
  coordinates: { x: serverNode.coordinatesX || 0, y: serverNode.coordinatesY || 0 },
  font: {
    style: serverNode.fontStyle || '',
    size: serverNode.fontSize || 12,
    weight: serverNode.fontWeight || '',
  },
  link: {
    href: serverNode.linkHref || ''
  },
  id: serverNode.id,
  detached: serverNode.detached || false,
  image: { src: serverNode.imageSrc || '', size: serverNode.imageSize || 0 },
  k: serverNode.k || 1,
  locked: serverNode.locked || false,
  name: serverNode.name || '',
  parent: serverNode.nodeParentId || null,
  isRoot: serverNode.root || false,
});

const mapMmpMapToClient = (serverMap: MmpMap, serverNodes: MmpNode[], deletedAt: Date, deleteAfterDays: number): IMmpClientMap => {
  return {
    uuid: serverMap.id,
    data: serverNodes.map((node) => mapMmpNodeToClient(node)),
    deleteAfterDays,
    deletedAt,
    lastModified: serverMap.lastModified,
    options: serverMap?.options
  }
};

const mapClientNodeToMmpNode = (clientNode: IMmpClientNode, mapId: string): Object => ({
  id: clientNode.id,
  colorsBackground: clientNode.colors.background,
  colorsBranch: clientNode.colors.branch,
  colorsName: clientNode.colors.name,
  coordinatesX: clientNode.coordinates.x,
  coordinatesY: clientNode.coordinates.y,
  fontSize: clientNode.font.size,
  fontStyle: clientNode.font.style,
  fontWeight: clientNode.font.weight,
  imageSrc: clientNode.image?.src,
  imageSize: clientNode.image?.size,
  k: clientNode.k,
  linkHref: clientNode.link?.href,
  locked: clientNode.locked,
  detached: clientNode.detached,
  name: clientNode.name,
  nodeParentId: clientNode.parent ? clientNode.parent : null,
  root: clientNode.isRoot,
  nodeMapId: mapId,
});

// Maps and enhances given properties to a valid root node
const mapClientBasicNodeToMmpRootNode = (clientRootNodeBasics: IMmpClientNodeBasics, mapId: string): Object => ({
  colorsBackground: clientRootNodeBasics.colors.background || DEFAULT_COLOR_BACKGROUND,
  colorsBranch: clientRootNodeBasics.colors.branch,
  colorsName: clientRootNodeBasics.colors.name || DEFAULT_COLOR_NAME,
  coordinatesX: 0,
  coordinatesY: 0,
  fontSize: clientRootNodeBasics.font.size || DEFAULT_FONT_SIZE,
  fontStyle: clientRootNodeBasics.font.style || DEFAULT_FONT_STYLE,
  fontWeight: clientRootNodeBasics.font.weight || DEFAULT_FONT_WEIGHT,
  imageSrc: clientRootNodeBasics.image?.src,
  imageSize: clientRootNodeBasics.image?.size,
  name: clientRootNodeBasics.name || DEFAULT_NAME,
  nodeParentId: null,
  root: true,
  detached: false,
  nodeMapId: mapId,
});

export { mapMmpNodeToClient, mapClientNodeToMmpNode, mapClientBasicNodeToMmpRootNode, mapMmpMapToClient };
