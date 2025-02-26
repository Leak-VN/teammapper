import Map from '../map'
import Node, {Colors, Coordinates, ExportNodeProperties, Font, Image, Link, NodeProperties} from '../models/node'
import {Event} from './events'
import Log from '../../utils/log'
import Utils from '../../utils/utils'
import { DefaultNodeValues } from '../options'

/**
 * Manage map history, for each change save a snapshot.
 */
export default class History {

    private map: Map

    private index: number
    private snapshots: MapSnapshot[]

    /**
     * Get the associated map instance, initialize index and snapshots.
     * @param {Map} map
     */
    constructor(map: Map) {
        this.map = map

        this.index = -1
        this.snapshots = []
    }

    /**
     * Return last snapshot of the current map.
     * @return {MapSnapshot} [snapshot] - Last snapshot of the map.
     */
    public current = (): MapSnapshot => {
        return this.snapshots[this.index]
    }

    /**
     * Replace old map with a new one or create a new empty map.
     * @param {MapSnapshot} snapshot
     */
    public new = (snapshot?: MapSnapshot, notifyWithEvent: boolean = true) => {
        if (snapshot === undefined) {

            this.map.nodes.setCounter(0)

            this.map.nodes.clear()

            this.map.draw.clear()
            this.map.draw.update()

            this.map.nodes.addRootNode()

            this.map.zoom.center('position', 0)

            this.save()

            if(notifyWithEvent) this.map.events.call(Event.create, this.map.dom)
        } else if (this.checkSnapshotStructure(snapshot)) {
            const previousData = this.map.export.asJSON()

            this.redraw(snapshot)

            this.map.zoom.center('position', 0)

            this.save()

            if(notifyWithEvent) this.map.events.call(Event.create, this.map.dom, { previousMap: previousData })
        } else {
            Log.error('The snapshot is not correct')
        }
    }

    /**
     * Undo last changes.
     */
    public undo = () => {
        if (this.index > 1) {
            this.redraw(this.snapshots[--this.index])
            this.map.events.call(Event.undo)
        }
    }

    /**
     * Redo one change which was undone.
     */
    public redo = () => {
        if (this.index < this.snapshots.length - 1) {
            this.redraw(this.snapshots[++this.index])
            this.map.events.call(Event.redo)
        }
    }

    /**
     * Save the current snapshot of the mind map.
     */
    public save() {
        if (this.index < this.snapshots.length - 1) {
            this.snapshots.splice(this.index + 1)
        }

        this.snapshots.push(this.getSnapshot())
        this.index++
    }

    /**
     * Return all history of map with all snapshots.
     * @returns {MapSnapshot[]}
     */
    public getHistory = (): ExportHistory => {
        return {
            snapshots: this.snapshots.slice(0),
            index: this.index
        }
    }

    /**
     * Redraw the map with a new snapshot.
     * @param {MapSnapshot} snapshot
     */
    private redraw(snapshot: MapSnapshot) {
        this.map.nodes.clear()

        snapshot.forEach((property: ExportNodeProperties) => {
            // in case the data model changes this makes sure all properties are at least present using defaults
            const mergedProperty = { ...DefaultNodeValues, ...property } as ExportNodeProperties
            const properties: NodeProperties = {
                id: mergedProperty.id,
                parent: mergedProperty.parent ? this.map.nodes.getNode(mergedProperty.parent) : null,
                k: mergedProperty.k,
                name: mergedProperty.name,
                coordinates: Utils.cloneObject(mergedProperty.coordinates) as Coordinates,
                image: Utils.cloneObject(mergedProperty.image) as Image,
                colors: Utils.cloneObject(mergedProperty.colors) as Colors,
                font: Utils.cloneObject(mergedProperty.font) as Font,
                link: Utils.cloneObject(mergedProperty.link) as Link,
                locked: mergedProperty.locked,
                isRoot: mergedProperty.isRoot
            }

            const node: Node = new Node(properties)
            this.map.nodes.setNode(node.id, node)

            if(mergedProperty.isRoot) this.map.rootId = mergedProperty.id
        })

        this.map.draw.clear()
        this.map.draw.update()

        this.map.nodes.selectRootNode()

        this.setCounter()
    }

    /**
     * Return a copy of all fundamental node properties.
     * @return {MapSnapshot} properties
     */
    private getSnapshot(): MapSnapshot {
        return this.map.nodes.getNodes().map((node: Node) => {
            return this.map.nodes.getNodeProperties(node, false)
        }).slice()
    }

    /**
     * Set the right counter value of the nodes.
     */
    private setCounter() {
        const id = this.map.nodes.getNodes().map((node: Node) => {
            const words = node.id.split('_')
            return parseInt(words[words.length - 1])
        })
        this.map.nodes.setCounter(Math.max(...id) + 1)
    }

    /**
     * Check the snapshot structure and return true if it is authentic.
     * @param {MapSnapshot} snapshot
     * @return {boolean} result
     */
    private checkSnapshotStructure(snapshot: MapSnapshot): boolean {
        if (!Array.isArray(snapshot)) {
            return false
        }

        if (((snapshot[0] as any).key && (snapshot[0] as any).value)) {
            this.convertOldMmp(snapshot)
        }

        for (const node of snapshot) {
            if (!this.checkNodeProperties(node)) {
                return false
            }
        }

        return true
    }

    /**
     * Check the snapshot node properties and return true if they are authentic.
     * @param {ExportNodeProperties} node
     * @return {boolean} result
     */
    private checkNodeProperties(node: ExportNodeProperties) {
        const conditions: boolean[] = [
            typeof node.id === 'string',
            typeof node.parent === 'string' || node.parent === null,
            typeof node.k === 'number',
            typeof node.name === 'string',
            typeof node.locked === 'boolean',
            // older maps do not include the link prop yet
            (node.link === undefined || typeof node.link.href === 'string'),
            node.coordinates
            && typeof node.coordinates.x === 'number'
            && typeof node.coordinates.y === 'number',
            node.image
            && typeof node.image.size === 'number'
            && typeof node.image.src === 'string',
            node.colors
            && typeof node.colors.background === 'string'
            && typeof node.colors.branch === 'string'
            && typeof node.colors.name === 'string',
            node.font
            && typeof node.font.size === 'number'
            && typeof node.font.weight === 'string'
            && typeof node.font.style === 'string'
        ]

        return conditions.every(condition => condition)
    }

    /**
     * Convert the old mmp (version: 0.1.7) snapshot to new.
     * @param {Array} snapshot
     */
    private convertOldMmp(snapshot: Array<any>) {
        for (const node of snapshot) {
            const oldNode = Utils.cloneObject(node)
            Utils.clearObject(node)

            node.id = 'map_node_' + oldNode.key.substr(4)
            node.parent = oldNode.value.parent ? 'map_node_' + oldNode.value.parent.substr(4) : ''
            node.k = oldNode.value.k
            node.name = oldNode.value.name
            node.locked = oldNode.value.fixed
            node.coordinates = {
                x: oldNode.value.x,
                y: oldNode.value.y
            }
            node.image = {
                size: parseInt(oldNode.value['image-size']),
                src: oldNode.value['image-src']
            }
            node.colors = {
                background: oldNode.value['background-color'],
                branch: oldNode.value['branch-color'] || '',
                name: oldNode.value['text-color']
            }
            node.font = {
                size: parseInt(oldNode.value['font-size']),
                weight: oldNode.value.bold ? 'bold' : 'normal',
                style: oldNode.value.italic ? 'italic' : 'normal'
            }
        }
    }

}

export interface ExportHistory {
    snapshots: Array<MapSnapshot>,
    index: number
}

export interface MapSnapshot extends Array<ExportNodeProperties> {
}