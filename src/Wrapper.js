import { isValidSelector } from './lib/validators'
import findVueComponents from './lib/findVueComponents'
import findMatchingVNodes from './lib/findMatchingVNodes'
import VueWrapper from './VueWrapper'

export default class Wrapper {
  constructor (vNode, update, mountedToDom) {
    this.vNode = vNode
    this.element = vNode.elm
    this.update = update
    this.mountedToDom = mountedToDom
  }

  /**
   * Checks if wrapper contains provided selector.
   *
   * @param {String} selector
   * @returns {Boolean}
   */
  contains (selector) {
    if (!isValidSelector(selector)) {
      throw new Error('wrapper.contains() must be passed a valid CSS selector or a Vue constructor')
    }

    if (typeof selector === 'object') {
      const vm = this.vm || this.vNode.context.$root
      return findVueComponents(vm, selector.name).length > 0
    }

    return this.element.querySelectorAll(selector).length > 0
  }

  /**
   * Finds every node in the mount tree of the current wrapper that matches the provided selector.
   *
   * @param {String|Object} selector
   * @returns {VueWrapper||VueWrapper[]}
   */
  find (selector) {
    if (!isValidSelector(selector)) {
      throw new Error('wrapper.find() must be passed a valid CSS selector or a Vue constructor')
    }

    if (typeof selector === 'object') {
      if (!selector.name) {
        throw new Error('.find() requires component to have a name property')
      }
      const vm = this.vm || this.vNode.context.$root
      const components = findVueComponents(vm, selector.name)
      return components.map(component => new VueWrapper(component, undefined, this.mounted))
    }

    const nodes = findMatchingVNodes(this.vNode, selector)

    return nodes.map(node => new Wrapper(node, this.update, this.mountedToDom))
  }

  /**
   * Sets vm data
   *
   * @param {Object} data - data to set
   */
  setData (data) {
    if (!this.isVueComponent) {
      throw new Error('wrapper.setData() can only be called on a Vue instance')
    }

    Object.keys(data).forEach((key) => {
      this.vm.$set(this.vm, [key], data[key])
    })
    this.update()
    this.vNode = this.vm._vnode
  }

  /**
   * Sets vm props
   *
   * @param {Object} data - data to set
   */
  setProps (data) {
    if (!this.isVueComponent) {
      throw new Error('wrapper.setProps() can only be called on a Vue instance')
    }

    Object.keys(data).forEach((key) => {
      this.vm._props[key] = data[key]
    })
    this.update()
    this.vNode = this.vm._vnode
  }
}