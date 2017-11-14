
const imgType = {
  'image/png': 1,
  'image/jpeg': 1,
  'image/gif': 1,
  'image/jpg': 1
}

export default {
  bind (el, binding, vnode) {
    
    let onDragOver = e => {
      e.preventDefault()
      const selection = window.getSelection ? window.getSelection() : document.getSelection()
      selection.collapse(e.target, 0)
    }
    let onDragLeave = e => {
      e.preventDefault()
    }

    let onDrop = e => {
      const selection = window.getSelection ? window.getSelection() : document.getSelection()
      if (e.dataTransfer && e.dataTransfer.files) {
        e.preventDefault()
        let files = e.dataTransfer.files
        for (let i = 0; i< files.length; i ++) {
          let curFile = files[i]
          if (curFile.size && imgType[curFile.type]) {
            binding.value(curFile)
          }
        }
      }
    }

    el.addEventListener('dragover', onDragOver, false)
    el.addEventListener('dragleave', onDragLeave, false)
    el.addEventListener('drop', onDrop, false)

    el.__dragOverHandler = onDragOver
    el.__dragLeaveHandler = onDragLeave
    el.__dropHandler = onDrop
  },
  unbind (el, binding) {
    el.removeEventListener('dragover', el.__dragOverHandler)
    el.removeEventListener('dragleave', el.__dragLeaveHandler)
    el.removeEventListener('drop', el.__dropHandler)
    delete el.__dragOverHandler
    delete el.__dragLeaveHandler
    delete el.__dropHandler
  }
}
