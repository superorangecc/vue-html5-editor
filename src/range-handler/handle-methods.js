const m = {
  /**
   * func add every elements of extArr to sourceArr.
   * @param sourceArr
   * @param extArr
   */
  mergeArray (sourceArr, extArr) {
    // note: Array.prototype.push.apply(arr1,arr2) is unreliable
    extArr.forEach((el) => {
      sourceArr.push(el)
    })
  },
  /**
   * func find all the descendant text nodes of a element
   * @param ancestor
   */
  getDescendantTextNodes (ancestor) {
    if (ancestor.nodeType === Node.TEXT_NODE) {
      return [ancestor]
    }
    const textNodes = []
    if (!ancestor.hasChildNodes()) {
      return textNodes
    }
    const childNodes = ancestor.childNodes
    for (let i = 0; i < childNodes.length; i++) {
      const node = childNodes[i]
      if (node.nodeType === Node.TEXT_NODE) {
        textNodes.push(node)
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        m.mergeArray(textNodes, m.getDescendantTextNodes(node))
      }
    }
    return textNodes
  },
  /**
   * func find all the descendant text nodes of an ancestor element that before the specify end element,
   * the ancestor element must contains the end element.
   * @param ancestor
   * @param endEl
   */
  getBeforeEndDescendantTextNodes (ancestor, endEl) {
    const textNodes = []
    let endIndex = 0
    for (let i = 0; i < ancestor.childNodes.length; i++) {
      if (ancestor.childNodes[i].contains(endEl)) {
        endIndex = i
        break
      }
    }

    for (let i = 0; i <= endIndex; i++) {
      const node = ancestor.childNodes[i]
      if (node === endEl) {
        m.mergeArray(textNodes, m.getDescendantTextNodes(node))
      } else if (i === endIndex) {
        if (node.nodeType === Node.TEXT_NODE) {
          textNodes.push(node)
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          m.mergeArray(textNodes, m.getBeforeEndDescendantTextNodes(node, endEl))
        }
      } else if (node.nodeType === Node.TEXT_NODE) {
        textNodes.push(node)
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        m.mergeArray(textNodes, m.getDescendantTextNodes(node))
      }
    }
    return textNodes
  },
  /**
   * func find all the descendant text nodes of an ancestor element that after the specify start element,
   * the ancestor element must contains the start element.
   * @param ancestor
   * @param startEl
   */
  getAfterStartDescendantTextNodes (ancestor, startEl) {
    const textNodes = []
    let startIndex = 0
    for (let i = 0; i < ancestor.childNodes.length; i++) {
      if (ancestor.childNodes[i].contains(startEl)) {
        startIndex = i
        break
      }
    }

    for (let i = startIndex; i < ancestor.childNodes.length; i++) {
      const node = ancestor.childNodes[i]
      if (node === startEl) {
        m.mergeArray(textNodes, m.getDescendantTextNodes(node))
      } else if (i === startIndex) {
        if (node.nodeType === Node.TEXT_NODE) {
          textNodes.push(node)
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          m.mergeArray(textNodes,
            m.getAfterStartDescendantTextNodes(node, startEl))
        }
      } else if (node.nodeType === Node.TEXT_NODE) {
        textNodes.push(node)
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        m.mergeArray(textNodes,
          m.getDescendantTextNodes(node))
      }
    }
    return textNodes
  },
  /**
   * func get the closest parent block node of a text node.
   * @param node
   * @return {Node}
   */
  getParentBlockNode (node) {
    const blockNodeNames = ['DIV', 'P', 'SECTION', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
      'OL', 'UL', 'LI', 'TR', 'TD', 'TH', 'TBODY', 'THEAD', 'TABLE', 'ARTICLE', 'HEADER', 'FOOTER', 'BLOCKQUOTE']
    let container = node
    while (container) {
      if (blockNodeNames.includes(container.nodeName)) {
        break
      }
      container = container.parentNode
    }
    return container
  },
  isInlineElement (node) {
    const inlineNodeNames = ['A', 'ABBR', 'ACRONYM', 'B', 'CITE', 'CODE', 'EM', 'I',
      'FONT', 'IMG', 'S', 'SMALL', 'SPAN', 'STRIKE', 'STRONG', 'U', 'SUB', 'SUP']
    return inlineNodeNames.includes(node.nodeName)
  },
  /*
   * func find all specify nodes in an ancestor through search opinions(unique attributes)
   * @param node
   * @param {obj}
   *     must have key 'tagName'
   * @return {arr}
   **/
  getAllSpecifyNode (ancestor, searchOpinion) {
    const targetTagName = searchOpinion.tagName
    delete searchOpinion.tagName
    const tags = ancestor.querySelectorAll(targetTagName)
    const result = []
    tags.forEach(tag => {
      const opinionKeys = Object.keys(searchOpinion)
      let pass = true
      opinionKeys.forEach(opinion => {
        var a = tag.getAttribute(opinion)
        if (tag.getAttribute(opinion) !== searchOpinion[opinion]) {
          pass = false
        }
      })
      if (pass) {
        result.push(tag)
      }
    })
    return result
  },
  /*
   * func find the number of nesting ancestor which has same node name
   * @param {node} current node
   * @param {str} ancestor's tag name
   * @return {num} number
   **/
  howManyNestAncestorSameTag (node, ancestorNodeName) {
    let num = 0
    while (node && (!node.dataset || (node.dataset.editor !== 'content'))) {
      if (node.nodeName === ancestorNodeName) {
        num++
      }
      node = node.parentNode
    }
    return num
  },
  getNodeNum (ancestor, nodeName) {
    return ancestor.querySelectorAll(nodeName).length
  },
  /**
   * find all the text nodes in range
   */
  getAllTextNodesInRange() {
    const startContainer = this.range.startContainer
    const endContainer = this.range.endContainer
    const rootEl = this.range.commonAncestorContainer
    const textNodes = []

    if (startContainer === endContainer) {
      if (startContainer.nodeType === Node.TEXT_NODE) {
        return [startContainer]
      }
      const childNodes = startContainer.childNodes
      for (let i = this.range.startOffset; i < this.range.endOffset; i++) {
        m.mergeArray(textNodes, m.getDescendantTextNodes(childNodes[i]))
      }
      return textNodes
    }

    let startIndex = 0
    let endIndex = 0
    for (let i = 0; i < rootEl.childNodes.length; i++) {
      const node = rootEl.childNodes[i]
      if (node.contains(startContainer)) {
        startIndex = i
      }
      if (node.contains(endContainer)) {
        endIndex = i
      }
    }

    for (let i = startIndex; i <= endIndex; i++) {
      const node = rootEl.childNodes[i]
      if (i === startIndex) {
        if (node.nodeType === Node.TEXT_NODE) {
          textNodes.push(node)
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          m.mergeArray(textNodes, m.getAfterStartDescendantTextNodes(node, startContainer))
        }
      } else if (i === endIndex) {
        if (node.nodeType === Node.TEXT_NODE) {
          textNodes.push(node)
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          m.mergeArray(textNodes, m.getBeforeEndDescendantTextNodes(node, endContainer))
        }
      } else if (node.nodeType === Node.TEXT_NODE) {
        textNodes.push(node)
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        m.mergeArray(textNodes, m.getDescendantTextNodes(node))
      }
    }
    return textNodes
  }
}

export default m
